/*
LEEWAY_HEADER - DO NOT REMOVE

REGION: VOICE_RUNTIME
TAG: CORE.AGENT_LEE.LEEWAY_AGENT_VOICE_RUNTIME.PLAYBACK_GATE.HARNESS
PURPOSE: Dynamic playback gate harness for LAVR local TTS interrupt and boundary semantics.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
*/

const path = require('path');
const fs = require('fs');
const { LavrPlaybackGate } = require('../out/leeway-agent-voice-runtime/lavrPlaybackGate.js');

function runHarness() {
  const events = [];
  const gate = new LavrPlaybackGate({
    onLifecycle: (record) => events.push(record)
  });

  const checks = [];

  const playbackA = gate.startPlayback({ lavrSessionId: 'lavr-session-test', lavrTurnId: 'lavr-turn-1' });
  const segmentA = gate.queueSegment(playbackA.lavrPlaybackId, 'lavr-seg-1');
  gate.completeSegment(playbackA.lavrPlaybackId, segmentA);

  checks.push({
    name: 'normal playback completion',
    pass: events.some((event) => event.eventType === 'LAVR_PLAYBACK_COMPLETED' && event.lavrPlaybackId === playbackA.lavrPlaybackId)
  });

  const playbackB = gate.startPlayback({ lavrSessionId: 'lavr-session-test', lavrTurnId: 'lavr-turn-2' });
  const segmentB = gate.queueSegment(playbackB.lavrPlaybackId, 'lavr-seg-2');
  const cancelAccepted = gate.cancelPlayback(playbackB.lavrPlaybackId, 'voice_barge_in_interrupt');

  checks.push({
    name: 'barge-in cancellation accepted exactly once',
    pass: cancelAccepted && events.some((event) => event.eventType === 'LAVR_PLAYBACK_CANCELLED' && event.lavrPlaybackId === playbackB.lavrPlaybackId)
  });

  const duplicateCancelAccepted = gate.cancelPlayback(playbackB.lavrPlaybackId, 'duplicate_cancel_attempt');
  checks.push({
    name: 'duplicate cancel suppression',
    pass: !duplicateCancelAccepted && events.some((event) => event.eventType === 'LAVR_PLAYBACK_DUPLICATE_STOP_SUPPRESSED' && event.lavrPlaybackId === playbackB.lavrPlaybackId)
  });

  const staleCompletionAccepted = gate.completeSegment(playbackB.lavrPlaybackId, segmentB);
  checks.push({
    name: 'stale segment suppression after cancel',
    pass: !staleCompletionAccepted && events.some((event) => event.eventType === 'LAVR_PLAYBACK_STALE_SEGMENT_SUPPRESSED' && event.lavrPlaybackId === playbackB.lavrPlaybackId)
  });

  const playbackC = gate.startPlayback({ lavrSessionId: 'lavr-session-test', lavrTurnId: 'lavr-turn-3' });
  const playbackD = gate.startPlayback({ lavrSessionId: 'lavr-session-test', lavrTurnId: 'lavr-turn-4' });
  const staleQueue = gate.queueSegment(playbackC.lavrPlaybackId, 'lavr-seg-old-turn');

  checks.push({
    name: 'new-turn playback boundary reset',
    pass: playbackC.lavrPlaybackId !== playbackD.lavrPlaybackId
      && gate.getActivePlaybackId() === playbackD.lavrPlaybackId
      && staleQueue === null
      && events.some((event) => event.eventType === 'LAVR_PLAYBACK_CANCELLED' && event.lavrPlaybackId === playbackC.lavrPlaybackId)
  });

  const passed = checks.filter((entry) => entry.pass).length;
  return {
    generatedAt: new Date().toISOString(),
    totals: {
      passed,
      total: checks.length
    },
    checks,
    events
  };
}

const result = runHarness();
const outputPath = path.join(__dirname, 'lavr-playback-gate-dynamic-result.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

if (result.totals.passed !== result.totals.total) {
  console.error(`LAVR playback gate dynamic harness failed (${result.totals.passed}/${result.totals.total}).`);
  process.exit(1);
}

console.log(`LAVR playback gate dynamic harness passed (${result.totals.passed}/${result.totals.total}).`);
console.log(`Result: ${outputPath}`);
