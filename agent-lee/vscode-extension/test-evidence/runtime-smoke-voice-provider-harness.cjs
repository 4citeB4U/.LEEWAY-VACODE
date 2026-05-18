const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { voiceProviderFactoryClientScript } = require('../out/live-voice/voiceProviderFactory.js');

function createLeeWayVoiceEventBus(){
  const listeners = new Map();
  return {
    on(type, handler){
      if(!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
      return () => {
        const arr = listeners.get(type) || [];
        const idx = arr.indexOf(handler);
        if(idx >= 0) arr.splice(idx, 1);
      };
    },
    emit(type, payload){
      const arr = listeners.get(type) || [];
      for(const fn of arr){
        try { fn(payload); } catch {}
      }
    }
  };
}

function makeSandbox(hasSpeech){
  const posted = [];
  const attachmentMeta = [];
  let turnSeq = 0;
  let interruptSeq = 0;
  class FakeRecognition {
    static instances = [];
    constructor(){
      this.lang = 'en-US';
      this.continuous = true;
      this.interimResults = true;
      this.maxAlternatives = 1;
      FakeRecognition.instances.push(this);
    }
    start(){ if(typeof this.onstart === 'function') this.onstart(); }
    stop(){ if(typeof this.onend === 'function') this.onend(); }
  }

  const windowObj = {
    agentLeeRuntimeState: {},
    agentLeeVoiceProviderReady: false,
    agentLeeVoiceProviderKind: '',
    agentLeeVoiceProvider: null,
    agentLeeRealtimeTurnBuffer: '',
    agentLeeRealtimeInterim: '',
    agentLeeRealtimeUserSpeaking: false,
    agentLeeRealtimeAssistantSpeaking: false,
    agentLeeAgentTurnActive: false,
    agentLeeMicShouldRun: false,
    agentLeeMicListening: false,
    agentLeeRealtimeCommitTimer: null,
    agentLeeLavrSessionId: 'lavr-session-smoke',
    agentLeeLavrTurnId: '',
    agentLeeLavrUtteranceId: '',
    agentLeeLavrInterruptId: '',
    agentLeeLavrTurnGateState: null
  };

  if(hasSpeech){
    windowObj.SpeechRecognition = FakeRecognition;
    windowObj.webkitSpeechRecognition = FakeRecognition;
  }

  const sandbox = {
    window: windowObj,
    document: { getElementById(){ return { style: { opacity: '0.6' } }; } },
    vscode: { postMessage(msg){ posted.push(msg); } },
    createLeeWayVoiceEventBus,
    emitLeeWayVoiceEvent(type, payload){
      posted.push({ command:'leewayVoiceEvent', event: Object.assign({ type, timestamp: Date.now() }, payload || {}) });
    },
    beginLavrUtterance(){
      turnSeq += 1;
      const turnId = `lavr-turn-${turnSeq}`;
      const utteranceId = `lavr-utt-${turnSeq}`;
      windowObj.agentLeeLavrTurnId = turnId;
      windowObj.agentLeeLavrUtteranceId = utteranceId;
      windowObj.agentLeeLavrInterruptId = '';
      windowObj.agentLeeLavrTurnGateState = {
        turnId,
        utteranceId,
        interruptId: '',
        hasFinal: false,
        hasCommitted: false,
        hasCancelled: false,
        finalNormalized: '',
        finalText: '',
        partialText: '',
        commitToken: (windowObj.agentLeeLavrTurnGateState && windowObj.agentLeeLavrTurnGateState.commitToken || 0) + 1
      };
      posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_TURN_STARTED', lavrTurnId:turnId, lavrUtteranceId:utteranceId } });
      return windowObj.agentLeeLavrTurnGateState;
    },
    updateLavrPartialText(text){
      const gate = windowObj.agentLeeLavrTurnGateState || sandbox.beginLavrUtterance();
      gate.partialText = String(text || '').trim();
      windowObj.agentLeeRealtimeInterim = gate.partialText;
      posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_PARTIAL_UPDATED', lavrTurnId:gate.turnId, lavrUtteranceId:gate.utteranceId, transcript:gate.partialText } });
      return gate;
    },
    updateLavrFinalText(text){
      const gate = windowObj.agentLeeLavrTurnGateState || sandbox.beginLavrUtterance();
      const finalText = String(text || '').trim();
      const norm = finalText.toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').replace(/\s+/g, ' ').trim();
      if(!norm) return { gate, accepted:false, duplicate:false };
      if(gate.finalNormalized === norm){
        posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_DUPLICATE_COMMIT_SUPPRESSED', lavrTurnId:gate.turnId, lavrUtteranceId:gate.utteranceId, reason:'duplicate_final' } });
        return { gate, accepted:false, duplicate:true };
      }
      gate.hasFinal = true;
      gate.finalNormalized = norm;
      gate.finalText = finalText;
      windowObj.agentLeeRealtimeTurnBuffer = finalText;
      posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_FINAL_RECEIVED', lavrTurnId:gate.turnId, lavrUtteranceId:gate.utteranceId, transcript:finalText } });
      return { gate, accepted:true, duplicate:false };
    },
    requestLavrInterrupt(reason){
      const gate = windowObj.agentLeeLavrTurnGateState || sandbox.beginLavrUtterance();
      if(gate.interruptId) return gate.interruptId;
      interruptSeq += 1;
      gate.interruptId = `lavr-int-${interruptSeq}`;
      windowObj.agentLeeLavrInterruptId = gate.interruptId;
      posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_INTERRUPT_REQUESTED', lavrTurnId:gate.turnId, lavrUtteranceId:gate.utteranceId, lavrInterruptId:gate.interruptId, reason: reason || 'user_barge_in' } });
      return gate.interruptId;
    },
    setAttachmentMeta(message, sticky){ attachmentMeta.push({ message, sticky: !!sticky }); },
    resetLeewayVoiceTurnState(){
      windowObj.agentLeeRealtimeTurnBuffer = '';
      windowObj.agentLeeRealtimeInterim = '';
      windowObj.agentLeeRealtimeUserSpeaking = false;
      if(windowObj.agentLeeRealtimeCommitTimer){ clearTimeout(windowObj.agentLeeRealtimeCommitTimer); }
      windowObj.agentLeeRealtimeCommitTimer = null;
      if(windowObj.agentLeeLavrTurnGateState){
        windowObj.agentLeeLavrTurnGateState.hasCancelled = true;
        windowObj.agentLeeLavrTurnGateState.commitToken = Number(windowObj.agentLeeLavrTurnGateState.commitToken || 0) + 1;
      }
    },
    cancelLeewayVoiceTurn(reason){
      const gate = windowObj.agentLeeLavrTurnGateState;
      if(!gate || gate.hasCommitted || gate.hasCancelled) return false;
      gate.hasCancelled = true;
      if(windowObj.agentLeeRealtimeCommitTimer){ clearTimeout(windowObj.agentLeeRealtimeCommitTimer); windowObj.agentLeeRealtimeCommitTimer = null; }
      posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_TURN_CANCELLED', lavrTurnId:gate.turnId, lavrUtteranceId:gate.utteranceId, reason: reason || 'cancelled' } });
      return true;
    },
    queueLeewayVoiceTurnCommitForSource(delayMs, source){
      const gate = windowObj.agentLeeLavrTurnGateState || sandbox.beginLavrUtterance();
      gate.commitToken = Number(gate.commitToken || 0) + 1;
      const token = gate.commitToken;
      if(windowObj.agentLeeRealtimeCommitTimer){ clearTimeout(windowObj.agentLeeRealtimeCommitTimer); }
      windowObj.agentLeeRealtimeCommitTimer = setTimeout(() => {
        const active = windowObj.agentLeeLavrTurnGateState;
        if(!active || active.commitToken !== token || active.hasCommitted || active.hasCancelled) return;
        const text = String(active.finalText || windowObj.agentLeeRealtimeTurnBuffer || '').trim();
        windowObj.agentLeeRealtimeTurnBuffer = '';
        windowObj.agentLeeRealtimeInterim = '';
        windowObj.agentLeeRealtimeUserSpeaking = false;
        if(!active.hasFinal){
          posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_SILENCE_TIMEOUT', lavrTurnId:active.turnId, lavrUtteranceId:active.utteranceId, source: source || 'timeout' } });
          active.hasCancelled = true;
          posted.push({ command:'leewayVoiceEvent', event:{ type:'LAVR_TURN_CANCELLED', lavrTurnId:active.turnId, lavrUtteranceId:active.utteranceId, reason:'interim_only_or_no_final' } });
          return;
        }
        active.hasCommitted = true;
        posted.push({ command:'leewayVoiceTurnCommit', text, lavrTurnId:active.turnId, lavrUtteranceId:active.utteranceId, lavrSessionId:windowObj.agentLeeLavrSessionId });
      }, Math.max(0, Number(delayMs) || 0));
    },
    queueLeewayVoiceTurnCommit(delayMs){
      return sandbox.queueLeewayVoiceTurnCommitForSource(delayMs, 'timeout');
    },
    fetch(){ return Promise.resolve({ ok: true }); },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    console,
    Math,
    Date,
    String,
    Object,
    Array,
    Number,
    Boolean,
    Promise
  };

  vm.createContext(sandbox);
  vm.runInContext(voiceProviderFactoryClientScript, sandbox);
  return { sandbox, posted, attachmentMeta, FakeRecognition };
}

function result(name, pass, details){ return { name, pass, details }; }

(async function main(){
  const checks = [];

  {
    const env = makeSandbox(true);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-browser-fallback';
    const ok = env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    const events = [];
    provider.on('LAVR_SESSION_CONNECTED', (p) => events.push({ type:'LAVR_SESSION_CONNECTED', payload:p }));
    provider.connect();

    const rec = env.FakeRecognition.instances[0];
    rec.onresult({
      resultIndex: 0,
      results: [{ 0: { transcript: 'browser mic hello' }, isFinal: true }]
    });

    await new Promise((r) => setTimeout(r, 220));

    const hasCommit = env.posted.some((m) => m && m.command === 'leewayVoiceTurnCommit' && /browser mic hello/.test(String(m.text || '')));
    const hasSessionConnected = events.some((e) => e.type === 'LAVR_SESSION_CONNECTED' && e.payload && e.payload.provider === 'leeway-agent-voice-browser-fallback');
    checks.push(result('LAVR browser fallback selected + mic commit path', ok && !!provider && provider.id === 'leeway-agent-voice-browser-fallback' && hasSessionConnected && hasCommit, {
      initOk: ok,
      providerId: provider && provider.id,
      sessionConnected: hasSessionConnected,
      postedCommit: hasCommit
    }));
  }

  {
    const env = makeSandbox(false);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-local';
    const ok = env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    const events = [];
    provider.on('LAVR_SESSION_CONNECTED', (p) => events.push({ type:'LAVR_SESSION_CONNECTED', payload:p }));
    provider.on('LAVR_SPEECH_FINAL', (p) => events.push({ type:'LAVR_SPEECH_FINAL', payload:p }));
    provider.connect();
    provider.sendUserText('local whisper text');
    await new Promise((r) => setTimeout(r, 180));

    const hasBridgeStart = env.posted.some((m) => m && m.command === 'leewayStartTranscriptBridge');
    const hasSessionConnected = events.some((e) => e.type === 'LAVR_SESSION_CONNECTED' && e.payload && e.payload.provider === 'leeway-agent-voice-local');
    const hasUserTurn = events.some((e) => e.type === 'LAVR_SPEECH_FINAL' && /local whisper text/.test(String(e.payload && e.payload.transcript || '')));
    const hasCommit = env.posted.some((m) => m && m.command === 'leewayVoiceTurnCommit' && /local whisper text/.test(String(m.text || '')));

    checks.push(result('LAVR local runtime selected + bridge + turn flow', ok && !!provider && provider.id === 'leeway-agent-voice-local' && hasBridgeStart && hasSessionConnected && hasUserTurn && hasCommit, {
      initOk: ok,
      providerId: provider && provider.id,
      bridgeStartPosted: hasBridgeStart,
      sessionConnected: hasSessionConnected,
      userTurnCommitted: hasUserTurn,
      postedCommit: hasCommit
    }));
  }

  {
    const env = makeSandbox(true);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-browser-fallback';
    env.sandbox.initLeeWayVoiceRuntime();
    const p1 = env.sandbox.window.agentLeeVoiceProvider;
    p1.connect();
    p1.disconnect('switch');

    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-local';
    env.sandbox.window.agentLeeVoiceProviderReady = false;
    const ok2 = env.sandbox.initLeeWayVoiceRuntime();
    const p2 = env.sandbox.window.agentLeeVoiceProvider;
    p2.connect();

    const switchHealthy = !!p1 && !!p2 && p1.id === 'leeway-agent-voice-browser-fallback' && p2.id === 'leeway-agent-voice-local' && ok2;
    checks.push(result('LAVR runtime switch browser-fallback -> local without corruption', switchHealthy, {
      firstProvider: p1 && p1.id,
      secondProvider: p2 && p2.id,
      secondInitOk: ok2
    }));
  }

  {
    const env = makeSandbox(false);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-local';
    env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    const events = [];
    provider.on('LAVR_TOOL_COMPLETED', (p) => events.push(p));
    provider.sendToolResult('call-1', { ok:true, source:'smoke' });
    const toolResultFlow = events.length === 1 && events[0].callId === 'call-1' && events[0].result && events[0].result.ok === true;
    checks.push(result('LAVR tool bus LAVR_TOOL_COMPLETED roundtrip', toolResultFlow, {
      receivedCount: events.length,
      first: events[0] || null
    }));
  }

  {
    const env = makeSandbox(true);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-browser-fallback';
    env.sandbox.window.agentLeeAgentTurnActive = true;
    env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    provider.connect();
    const rec = env.FakeRecognition.instances[0];

    rec.onresult({ resultIndex:0, results:[{ 0:{ transcript:'interrupt now' }, isFinal:false }] });
    rec.onresult({ resultIndex:0, results:[{ 0:{ transcript:'interrupt still speaking' }, isFinal:false }] });

    const bargeMsgs = env.posted.filter((m) => m && m.command === 'leewayVoiceInterruptRequested');
    checks.push(result('LAVR interrupt gate emits single leewayVoiceInterruptRequested', bargeMsgs.length === 1, {
      bargeInCount: bargeMsgs.length
    }));
  }

  {
    const env = makeSandbox(true);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-browser-fallback';
    env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    provider.connect();
    const rec = env.FakeRecognition.instances[0];

    rec.onresult({ resultIndex:0, results:[{ 0:{ transcript:'same final text' }, isFinal:true }] });
    rec.onresult({ resultIndex:0, results:[{ 0:{ transcript:'same final text' }, isFinal:true }] });
    await new Promise((r) => setTimeout(r, 260));

    const commits = env.posted.filter((m) => m && m.command === 'leewayVoiceTurnCommit');
    checks.push(result('LAVR duplicate final suppression keeps exactly one commit', commits.length === 1, {
      commitCount: commits.length,
      firstCommit: commits[0] || null
    }));
  }

  {
    const env = makeSandbox(true);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-browser-fallback';
    env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    provider.connect();
    const rec = env.FakeRecognition.instances[0];

    rec.onresult({ resultIndex:0, results:[{ 0:{ transcript:'interim only sample' }, isFinal:false }] });
    await new Promise((r) => setTimeout(r, 520));

    const commits = env.posted.filter((m) => m && m.command === 'leewayVoiceTurnCommit');
    const cancelled = env.posted.some((m) => m && m.command === 'leewayVoiceEvent' && m.event && m.event.type === 'LAVR_TURN_CANCELLED');
    checks.push(result('LAVR interim-only turn is cancelled without commit', commits.length === 0 && cancelled, {
      commitCount: commits.length,
      hasCancelledEvent: cancelled
    }));
  }

  {
    const env = makeSandbox(true);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-browser-fallback';
    env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    provider.connect();
    const rec = env.FakeRecognition.instances[0];

    rec.onresult({ resultIndex:0, results:[{ 0:{ transcript:'stale timer text' }, isFinal:true }] });
    env.sandbox.resetLeewayVoiceTurnState();
    await new Promise((r) => setTimeout(r, 260));

    const commits = env.posted.filter((m) => m && m.command === 'leewayVoiceTurnCommit');
    checks.push(result('LAVR stale commit timer is cancelled on turn reset', commits.length === 0, {
      commitCount: commits.length
    }));
  }

  {
    const env = makeSandbox(true);
    env.sandbox.window.agentLeeRuntimeState.leewayVoiceRuntimeKind = 'leeway-agent-voice-browser-fallback';
    env.sandbox.window.agentLeeRealtimeAssistantSpeaking = true;
    env.sandbox.window.agentLeeAgentTurnActive = true;
    env.sandbox.initLeeWayVoiceRuntime();
    const provider = env.sandbox.window.agentLeeVoiceProvider;
    provider.connect();
    const rec = env.FakeRecognition.instances[0];

    rec.onresult({ resultIndex:0, results:[{ 0:{ transcript:'assistant interruption path' }, isFinal:false }] });

    const interrupts = env.posted.filter((m) => m && m.command === 'leewayVoiceInterruptRequested');
    const interruptEvents = env.posted.filter((m) => m && m.command === 'leewayVoiceEvent' && m.event && m.event.type === 'LAVR_INTERRUPT_REQUESTED');
    checks.push(result('LAVR assistant-active speech requests exactly one interrupt', interrupts.length === 1 && interruptEvents.length >= 1, {
      interruptCommandCount: interrupts.length,
      interruptEventCount: interruptEvents.length,
      firstInterruptEvent: interruptEvents[0] || null
    }));
  }

  const extensionTsPath = path.resolve('src/extension.ts');
  const hostText = fs.readFileSync(extensionTsPath, 'utf8');
  const hostHasToolCallHandler = hostText.includes('if (eventType === "LAVR_TOOL_REQUESTED")') && hostText.includes('command: "leewayVoiceToolCompleted"');
  const hostHasToolResultStatus = hostText.includes('if (eventType === "LAVR_TOOL_COMPLETED")');
  checks.push(result('LAVR host router contains LAVR_TOOL_REQUESTED + LAVR_TOOL_COMPLETED handlers', hostHasToolCallHandler && hostHasToolResultStatus, {
    hasToolCallHandler: hostHasToolCallHandler,
    hasToolResultHandler: hostHasToolResultStatus
  }));

  const hasStableLifecycleIds =
    hostText.includes('lavrToolRequestId') &&
    hostText.includes('lavrTurnId') &&
    hostText.includes('lavrSessionId');
  checks.push(result('LAVR lifecycle includes stable request/turn/session IDs', hasStableLifecycleIds, {
    hasLavrToolRequestId: hostText.includes('lavrToolRequestId'),
    hasLavrTurnId: hostText.includes('lavrTurnId'),
    hasLavrSessionId: hostText.includes('lavrSessionId')
  }));

  const hasFailureTerminalPath =
    hostText.includes('terminalStatus') &&
    hostText.includes('"failed"') &&
    hostText.includes('finalizeLavrToolRequest(webview, lavrToolRequestId, "failed"');
  checks.push(result('LAVR failure path posts terminal failed result', hasFailureTerminalPath, {
    hasTerminalStatusField: hostText.includes('terminalStatus'),
    hasFailedStatus: hostText.includes('"failed"'),
    hasFailedFinalizeCall: hostText.includes('finalizeLavrToolRequest(webview, lavrToolRequestId, "failed"')
  }));

  const hasDuplicateSuppression =
    hostText.includes('duplicate-request-suppressed') &&
    hostText.includes('duplicate-result-suppressed') &&
    hostText.includes('agentLeeLavrTerminalResultSet');
  checks.push(result('LAVR duplicate request/result suppression present', hasDuplicateSuppression, {
    suppressesDuplicateRequests: hostText.includes('duplicate-request-suppressed'),
    suppressesDuplicateResults: hostText.includes('duplicate-result-suppressed'),
    webviewTerminalSet: hostText.includes('agentLeeLavrTerminalResultSet')
  }));

  const hasTimeoutPath =
    hostText.includes('LAVR_TOOL_TIMEOUT_MS') &&
    hostText.includes('"timed_out"') &&
    hostText.includes('timed out after');
  checks.push(result('LAVR timeout path posts terminal timed_out result', hasTimeoutPath, {
    hasTimeoutConstant: hostText.includes('LAVR_TOOL_TIMEOUT_MS'),
    hasTimedOutStatus: hostText.includes('"timed_out"'),
    hasTimeoutErrorMessage: hostText.includes('timed out after')
  }));

  const hasCancellationPath =
    hostText.includes('cancelPendingLavrToolRequests(webview') &&
    hostText.includes('"cancelled"') &&
    hostText.includes('leewayVoiceInterruptRequested');
  checks.push(result('LAVR interruption cancels pending requests with terminal cancelled result', hasCancellationPath, {
    hasCancelPendingHook: hostText.includes('cancelPendingLavrToolRequests(webview'),
    hasCancelledStatus: hostText.includes('"cancelled"'),
    hasInterruptHook: hostText.includes('leewayVoiceInterruptRequested')
  }));

  const summary = {
    date: new Date().toISOString(),
    checks,
    passed: checks.filter((c) => c.pass).length,
    failed: checks.filter((c) => !c.pass).length
  };

  const outPath = path.resolve('test-evidence/runtime-smoke-voice-provider-result.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`RESULT_FILE=${outPath}`);
  process.exit(summary.failed > 0 ? 1 : 0);
})();

