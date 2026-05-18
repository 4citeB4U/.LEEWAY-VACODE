const fs = require('fs');
const path = require('path');

const {
  buildDefaultLeewayLiveVoiceManifest,
  detectOneWordSpeechFailure,
  evaluateLeewayLiveVoiceRoutes,
  loadLeewayLiveVoiceManifest,
  planLeewayLiveVoiceSegments
} = require('../out/core/leeway-live-voice-route-manager.js');

function check(name, pass, details){
  return { name, pass, details };
}

const manifest = loadLeewayLiveVoiceManifest();
const checks = [];

checks.push(check(
  'active voice manifest loads',
  !!manifest && manifest.voice && Array.isArray(manifest.voice.routes) && manifest.voice.routes.length >= 4,
  { routeCount: manifest && manifest.voice && manifest.voice.routes ? manifest.voice.routes.length : 0 }
));

checks.push(check(
  'non-LeeWay engine is not default and not normal fallback',
  manifest.voice.allowNonLeewayDefault === false,
  { allowNonLeewayDefault: manifest.voice.allowNonLeewayDefault }
));

checks.push(check(
  'primary/compact/branded/text routes are registered',
  ['leeway.voice.primary.clone.live','leeway.voice.compact.clone.live','leeway.voice.branded.live','leeway.voice.text.emergency']
    .every((id) => manifest.voice.routes.some((route) => route.id === id)),
  { routeIds: manifest.voice.routes.map((route) => route.id) }
));

{
  const decision = evaluateLeewayLiveVoiceRoutes(manifest, {
    cloneScriptReady: true,
    selectedCloneIdentityReady: true,
    compactCloneReady: true,
    brandedVoiceReady: true,
    nonLeewayDefaultConfigured: false,
    externalProviderConfigured: false
  });
  checks.push(check(
    'primary clone route is selected when healthy',
    decision.selectedRouteId === 'leeway.voice.primary.clone.live',
    decision
  ));
}

{
  const decision = evaluateLeewayLiveVoiceRoutes(manifest, {
    cloneScriptReady: true,
    selectedCloneIdentityReady: false,
    compactCloneReady: true,
    brandedVoiceReady: true,
    nonLeewayDefaultConfigured: false,
    externalProviderConfigured: false
  });
  checks.push(check(
    'compact clone route is selected when primary is unhealthy',
    decision.selectedRouteId === 'leeway.voice.compact.clone.live',
    decision
  ));
}

{
  const customManifest = buildDefaultLeewayLiveVoiceManifest();
  const compact = customManifest.voice.routes.find((route) => route.id === 'leeway.voice.compact.clone.live');
  if (compact) compact.enabled = false;
  const decision = evaluateLeewayLiveVoiceRoutes(customManifest, {
    cloneScriptReady: true,
    selectedCloneIdentityReady: false,
    compactCloneReady: false,
    brandedVoiceReady: true,
    nonLeewayDefaultConfigured: false,
    externalProviderConfigured: false
  });
  checks.push(check(
    'branded route is selected only after clone and compact clone are unavailable',
    decision.selectedRouteId === 'leeway.voice.branded.live',
    decision
  ));
}

{
  const decision = evaluateLeewayLiveVoiceRoutes(manifest, {
    cloneScriptReady: false,
    selectedCloneIdentityReady: false,
    compactCloneReady: false,
    brandedVoiceReady: false,
    nonLeewayDefaultConfigured: false,
    externalProviderConfigured: false
  });
  checks.push(check(
    'text-only emergency activates when no live LeeWay-owned route is healthy',
    decision.selectedRouteId === 'leeway.voice.text.emergency' && /Text-only emergency/i.test(decision.visibleStatus),
    decision
  ));
}

{
  const decision = evaluateLeewayLiveVoiceRoutes(manifest, {
    cloneScriptReady: true,
    selectedCloneIdentityReady: true,
    compactCloneReady: true,
    brandedVoiceReady: true,
    nonLeewayDefaultConfigured: true,
    externalProviderConfigured: false
  });
  checks.push(check(
    'non-LeeWay default engine is rejected',
    decision.selectedRouteId === 'leeway.voice.text.emergency' &&
      decision.policyViolations.includes('LEEWAY_APP::VOICE::POLICY::NO_FOREIGN_DEFAULT'),
    decision
  ));
}

{
  const decision = evaluateLeewayLiveVoiceRoutes(manifest, {
    cloneScriptReady: true,
    selectedCloneIdentityReady: true,
    compactCloneReady: true,
    brandedVoiceReady: true,
    nonLeewayDefaultConfigured: false,
    externalProviderConfigured: true
  });
  checks.push(check(
    'external provider routes are rejected',
    decision.selectedRouteId === 'leeway.voice.text.emergency' &&
      decision.policyViolations.includes('LEEWAY_APP::VOICE::POLICY::LEEWAY_OWNED_ONLY'),
    decision
  ));
}

{
  const plan = planLeewayLiveVoiceSegments(
    'Agent Lee is online and speaking in multiple segments. The runtime should not collapse this into one lonely word.',
    'leeway.voice.primary.clone.live',
    true
  );
  checks.push(check(
    'live voice path proves more than one segment can be emitted when text is long enough',
    plan.segments.length > 1,
    plan
  ));
}

{
  const oneWord = detectOneWordSpeechFailure(
    'Agent Lee should speak several words here.',
    ['Agent']
  );
  checks.push(check(
    'one-word speech failure is detected by stream lifecycle evidence',
    oneWord.failed === true,
    oneWord
  ));
}

{
  const plan = planLeewayLiveVoiceSegments(
    'Agent Lee is degraded.',
    'leeway.voice.text.emergency',
    true
  );
  checks.push(check(
    'voice failure surfaces truthful non-speech diagnostics instead of fake success',
    plan.segments.length === 0 && /Text-only emergency/i.test(plan.reason),
    plan
  ));
}

const result = {
  gate: 'LEEWAY_RUNTIME_TRUTH_LIVE_VOICE_ROUTE',
  generatedAt: new Date().toISOString(),
  passed: checks.every((entry) => entry.pass),
  checks
};

const outputPath = path.join(__dirname, 'runtime-truth-live-voice-route-result.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

if (!result.passed) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
