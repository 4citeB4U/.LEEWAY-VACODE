/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: VOICE_RUNTIME
TAG: CORE.AGENT_LEE.LEEWAY_AGENT_VOICE_RUNTIME.HOST_ROUTER.HARNESS
PURPOSE: Dynamic host-router lifecycle harness for LAVR tool bus semantics.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

const path = require('path');
const fs = require('fs');

function createHarness(options = {}) {
  const timeoutMs = Number(options.timeoutMs || 40);
  const events = [];
  const posts = [];
  const lifecycle = [];

  const lavrToolByRequestId = new Map();
  const lavrRequestByCallId = new Map();
  let lavrHostTurnCounter = 0;
  const lavrHostSessionId = `lavr-session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const webview = {
    postMessage(payload) {
      posts.push(payload);
    }
  };

  function nextLavrHostId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeLavrTerminalStatus(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'completed' || raw === 'failed' || raw === 'cancelled' || raw === 'timed_out') return raw;
    return 'failed';
  }

  function recordLavrToolLifecycle(event, payload) {
    lifecycle.push({ event, payload: { ...payload } });
  }

  function finalizeLavrToolRequest(requestId, terminalStatus, payload) {
    const state = lavrToolByRequestId.get(requestId);
    if (!state) return false;

    if (state.status !== 'pending') {
      recordLavrToolLifecycle('duplicate-result-suppressed', {
        requestId,
        callId: state.callId,
        lavrSessionId: state.lavrSessionId,
        lavrTurnId: state.lavrTurnId,
        existingStatus: state.status,
        attemptedStatus: terminalStatus
      });
      return false;
    }

    const signature = `${requestId}:${terminalStatus}:${String(payload.receiptId || '')}`;
    if (state.resultSignature === signature) {
      recordLavrToolLifecycle('duplicate-result-suppressed', {
        requestId,
        callId: state.callId,
        lavrSessionId: state.lavrSessionId,
        lavrTurnId: state.lavrTurnId,
        reason: 'same-result-signature'
      });
      return false;
    }

    if (state.timeoutHandle) {
      clearTimeout(state.timeoutHandle);
      state.timeoutHandle = null;
    }

    state.status = terminalStatus;
    state.finishedAt = Date.now();
    state.resultSignature = signature;
    state.pluginId = payload.pluginId || state.pluginId;
    state.action = payload.action || state.action;

    webview.postMessage({
      command: 'leewayVoiceToolCompleted',
      callId: state.callId,
      lavrToolRequestId: state.requestId,
      lavrTurnId: state.lavrTurnId,
      lavrSessionId: state.lavrSessionId,
      terminalStatus,
      ok: payload.ok ?? terminalStatus === 'completed',
      pluginId: payload.pluginId || '',
      action: payload.action || '',
      summary: payload.summary || '',
      result: payload.result,
      error: payload.error,
      receiptId: payload.receiptId || '',
      requiresFollowUp: !!payload.requiresFollowUp
    });

    recordLavrToolLifecycle('result-returned', {
      requestId: state.requestId,
      callId: state.callId,
      lavrSessionId: state.lavrSessionId,
      lavrTurnId: state.lavrTurnId,
      terminalStatus,
      pluginId: state.pluginId || payload.pluginId || '',
      action: state.action || payload.action || '',
      receiptId: payload.receiptId || ''
    });
    return true;
  }

  function cancelPendingLavrToolRequests(reason) {
    for (const [requestId, state] of lavrToolByRequestId.entries()) {
      if (state.status !== 'pending') continue;
      finalizeLavrToolRequest(requestId, 'cancelled', {
        ok: false,
        pluginId: state.pluginId || '',
        action: state.action || '',
        error: reason,
        summary: 'LAVR tool request cancelled.'
      });
    }
  }

  async function onMessage(msg, pluginExecutor) {
    if (msg.command === 'leewayVoiceInterruptRequested') {
      cancelPendingLavrToolRequests('LAVR tool request cancelled by voice interruption.');
      return;
    }

    if (msg.command !== 'leewayVoiceEvent') return;

    const event = (msg.event && typeof msg.event === 'object') ? msg.event : {};
    const eventType = String(event.type || 'unknown');
    const callId = String(event.callId || nextLavrHostId('lavr-call'));
    const lavrToolRequestId = String(event.lavrToolRequestId || callId || nextLavrHostId('lavr-tool')).trim();
    const lavrSessionId = String(event.lavrSessionId || lavrHostSessionId).trim() || lavrHostSessionId;
    const lavrTurnId = String(event.lavrTurnId || `lavr-turn-${++lavrHostTurnCounter}`).trim();

    if (eventType === 'LAVR_TOOL_REQUESTED') {
      const existingByRequest = lavrToolByRequestId.get(lavrToolRequestId);
      if (existingByRequest) {
        recordLavrToolLifecycle('duplicate-request-suppressed', {
          requestId: lavrToolRequestId,
          callId,
          lavrSessionId,
          lavrTurnId,
          existingStatus: existingByRequest.status
        });
        return;
      }

      const existingRequestId = lavrRequestByCallId.get(callId);
      if (existingRequestId) {
        recordLavrToolLifecycle('duplicate-request-suppressed', {
          requestId: existingRequestId,
          callId,
          lavrSessionId,
          lavrTurnId,
          reason: 'callId-already-bound'
        });
        return;
      }

      const pluginId = String(event.pluginId || 'test.plugin');
      const action = String(event.action || 'run');

      const state = {
        requestId: lavrToolRequestId,
        callId,
        lavrSessionId,
        lavrTurnId,
        status: 'pending',
        createdAt: Date.now(),
        pluginId,
        action,
        providerAcceptedResult: false,
        timeoutHandle: null
      };

      state.timeoutHandle = setTimeout(() => {
        finalizeLavrToolRequest(lavrToolRequestId, 'timed_out', {
          ok: false,
          pluginId: state.pluginId || '',
          action: state.action || '',
          error: `LAVR tool request timed out after ${timeoutMs}ms.`,
          summary: 'LAVR tool request timed out before completion.'
        });
      }, timeoutMs);

      lavrToolByRequestId.set(lavrToolRequestId, state);
      lavrRequestByCallId.set(callId, lavrToolRequestId);

      recordLavrToolLifecycle('request-emitted', {
        requestId: lavrToolRequestId,
        callId,
        lavrSessionId,
        lavrTurnId,
        pluginId,
        action
      });

      state.executionStartedAt = Date.now();
      recordLavrToolLifecycle('execution-started', {
        requestId: lavrToolRequestId,
        callId,
        lavrSessionId,
        lavrTurnId,
        pluginId,
        action
      });

      try {
        const result = await pluginExecutor({ pluginId, action, callId, lavrToolRequestId, lavrTurnId, lavrSessionId });
        finalizeLavrToolRequest(lavrToolRequestId, result.ok ? 'completed' : 'failed', {
          ok: !!result.ok,
          pluginId,
          action,
          summary: result.summary || '',
          result: result.data,
          error: result.error,
          receiptId: result.receiptId || ''
        });
      } catch (error) {
        finalizeLavrToolRequest(lavrToolRequestId, 'failed', {
          ok: false,
          pluginId,
          action,
          error: String(error && error.message ? error.message : error),
          summary: 'LAVR tool request failed during host execution.'
        });
      }
      return;
    }

    if (eventType === 'LAVR_TOOL_COMPLETED') {
      const resolvedRequestId = String(event.lavrToolRequestId || lavrRequestByCallId.get(callId) || '').trim();
      const terminalStatus = normalizeLavrTerminalStatus(event.terminalStatus);
      if (resolvedRequestId) {
        const lifecycleState = lavrToolByRequestId.get(resolvedRequestId);
        if (lifecycleState && !lifecycleState.providerAcceptedResult) {
          lifecycleState.providerAcceptedResult = true;
          recordLavrToolLifecycle('provider-accepted-result', {
            requestId: resolvedRequestId,
            callId: lifecycleState.callId,
            lavrSessionId: lifecycleState.lavrSessionId,
            lavrTurnId: lifecycleState.lavrTurnId,
            terminalStatus
          });
        }
      }
      return;
    }
  }

  return {
    onMessage,
    events,
    posts,
    lifecycle,
    stateByRequestId: lavrToolByRequestId,
    requestByCallId: lavrRequestByCallId,
    finalizeLavrToolRequest,
    normalizeLavrTerminalStatus
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function check(name, fn) {
  try {
    fn();
    return { name, pass: true };
  } catch (error) {
    return { name, pass: false, error: String(error && error.message ? error.message : error) };
  }
}

(async function main() {
  const checks = [];

  {
    const h = createHarness({ timeoutMs: 80 });
    await h.onMessage({
      command: 'leewayVoiceEvent',
      event: {
        type: 'LAVR_TOOL_REQUESTED',
        callId: 'call-success',
        lavrToolRequestId: 'req-success',
        lavrTurnId: 'turn-success',
        lavrSessionId: 'session-success',
        pluginId: 'plugin.success',
        action: 'run'
      }
    }, async () => ({ ok: true, data: { ok: true }, summary: 'done', receiptId: 'rcpt-1' }));

    await h.onMessage({
      command: 'leewayVoiceEvent',
      event: {
        type: 'LAVR_TOOL_COMPLETED',
        callId: 'call-success',
        lavrToolRequestId: 'req-success',
        terminalStatus: 'completed'
      }
    }, async () => ({ ok: true }));

    checks.push(check('success terminal path', () => {
      const terminal = h.posts.find((p) => p.command === 'leewayVoiceToolCompleted' && p.lavrToolRequestId === 'req-success');
      assert(!!terminal, 'missing terminal message for success');
      assert(terminal.terminalStatus === 'completed', 'expected completed terminal status');
      const accepted = h.lifecycle.find((e) => e.event === 'provider-accepted-result' && e.payload.requestId === 'req-success');
      assert(!!accepted, 'missing provider accepted receipt event');
    }));
  }

  {
    const h = createHarness({ timeoutMs: 80 });
    await h.onMessage({
      command: 'leewayVoiceEvent',
      event: {
        type: 'LAVR_TOOL_REQUESTED',
        callId: 'call-failed',
        lavrToolRequestId: 'req-failed',
        lavrTurnId: 'turn-failed',
        lavrSessionId: 'session-failed',
        pluginId: 'plugin.failed',
        action: 'run'
      }
    }, async () => ({ ok: false, error: 'forced failure', receiptId: 'rcpt-2' }));

    checks.push(check('failed terminal path', () => {
      const terminal = h.posts.find((p) => p.lavrToolRequestId === 'req-failed');
      assert(!!terminal, 'missing terminal message for failed path');
      assert(terminal.terminalStatus === 'failed', 'expected failed terminal status');
      assert(terminal.ok === false, 'failed path should set ok=false');
    }));
  }

  {
    const h = createHarness({ timeoutMs: 80 });
    let execCount = 0;
    const req = {
      command: 'leewayVoiceEvent',
      event: {
        type: 'LAVR_TOOL_REQUESTED',
        callId: 'call-dup-request',
        lavrToolRequestId: 'req-dup-request',
        lavrTurnId: 'turn-dup-request',
        lavrSessionId: 'session-dup-request',
        pluginId: 'plugin.dupreq',
        action: 'run'
      }
    };

    await h.onMessage(req, async () => { execCount += 1; return { ok: true }; });
    await h.onMessage(req, async () => { execCount += 1; return { ok: true }; });

    checks.push(check('duplicate request suppression', () => {
      assert(execCount === 1, `expected one execution, received ${execCount}`);
      const suppressed = h.lifecycle.filter((e) => e.event === 'duplicate-request-suppressed');
      assert(suppressed.length === 1, 'missing duplicate request suppression event');
    }));
  }

  {
    const h = createHarness({ timeoutMs: 80 });
    await h.onMessage({
      command: 'leewayVoiceEvent',
      event: {
        type: 'LAVR_TOOL_REQUESTED',
        callId: 'call-dup-result',
        lavrToolRequestId: 'req-dup-result',
        lavrTurnId: 'turn-dup-result',
        lavrSessionId: 'session-dup-result',
        pluginId: 'plugin.dupres',
        action: 'run'
      }
    }, async () => ({ ok: true, receiptId: 'rcpt-3' }));

    const duplicateAccepted = h.finalizeLavrToolRequest('req-dup-result', 'completed', { ok: true, receiptId: 'rcpt-3' });
    checks.push(check('duplicate result suppression', () => {
      assert(duplicateAccepted === false, 'duplicate result should be rejected');
      const suppressed = h.lifecycle.filter((e) => e.event === 'duplicate-result-suppressed');
      assert(suppressed.length >= 1, 'missing duplicate result suppression event');
    }));
  }

  {
    const h = createHarness({ timeoutMs: 30 });
    h.onMessage({
      command: 'leewayVoiceEvent',
      event: {
        type: 'LAVR_TOOL_REQUESTED',
        callId: 'call-timeout',
        lavrToolRequestId: 'req-timeout',
        lavrTurnId: 'turn-timeout',
        lavrSessionId: 'session-timeout',
        pluginId: 'plugin.timeout',
        action: 'run'
      }
    }, async () => new Promise(() => {}));

    await new Promise((resolve) => setTimeout(resolve, 55));

    checks.push(check('timeout finalization', () => {
      const terminal = h.posts.find((p) => p.lavrToolRequestId === 'req-timeout');
      assert(!!terminal, 'missing timed_out terminal post');
      assert(terminal.terminalStatus === 'timed_out', 'expected timed_out terminal status');
    }));
  }

  {
    const h = createHarness({ timeoutMs: 200 });
    h.onMessage({
      command: 'leewayVoiceEvent',
      event: {
        type: 'LAVR_TOOL_REQUESTED',
        callId: 'call-cancel',
        lavrToolRequestId: 'req-cancel',
        lavrTurnId: 'turn-cancel',
        lavrSessionId: 'session-cancel',
        pluginId: 'plugin.cancel',
        action: 'run'
      }
    }, async () => new Promise(() => {}));

    await new Promise((resolve) => setTimeout(resolve, 10));

    await h.onMessage({ command: 'leewayVoiceInterruptRequested' }, async () => ({ ok: true }));

    checks.push(check('cancellation on interruption', () => {
      const terminal = h.posts.find((p) => p.lavrToolRequestId === 'req-cancel');
      assert(!!terminal, 'missing cancelled terminal post');
      assert(terminal.terminalStatus === 'cancelled', 'expected cancelled terminal status');
      const hasReceipt = h.lifecycle.some((e) => e.event === 'result-returned' && e.payload.requestId === 'req-cancel');
      assert(hasReceipt, 'missing cancellation lifecycle receipt');
    }));
  }

  {
    const extensionPath = path.resolve('src/extension.ts');
    const source = fs.readFileSync(extensionPath, 'utf8');
    checks.push(check('host router wiring references lifecycle transitions', () => {
      assert(source.includes('cancelPendingLavrToolRequests(webview'), 'missing cancellation hook in extension host router');
      assert(source.includes('finalizeLavrToolRequest(webview, lavrToolRequestId, "timed_out"'), 'missing timeout finalization call in extension host router');
      assert(source.includes('recordLavrToolLifecycle("provider-accepted-result"'), 'missing provider accepted lifecycle receipt');
    }));
  }

  const summary = {
    date: new Date().toISOString(),
    checks,
    passed: checks.filter((c) => c.pass).length,
    failed: checks.filter((c) => !c.pass).length
  };

  const outPath = path.resolve('test-evidence/lavr-host-router-dynamic-result.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`RESULT_FILE=${outPath}`);
  process.exit(summary.failed > 0 ? 1 : 0);
})();
