---
name: leeway-live-voice-runtime
description: Preserve LeeWay-owned live voice routing for Agent Lee. Use when repairing, testing, or extending Agent Lee speech so non-LeeWay runtimes, Edge TTS, and external APIs do not become the normal fallback path.
---

# LeeWay Live Voice Runtime

Use this skill when Agent Lee speech is slow, missing, clipped, downgraded, or being rerouted through non-LeeWay voice engines.

## Core Law

- Non-LeeWay voice runtimes are not a normal fallback.
- External APIs are not a normal fallback.
- LeeWay live voice must remain local/self-owned, manifest-governed, and route-managed.
- Clone voice falls back in this order only:
  1. `leeway.voice.primary.clone.live`
  2. `leeway.voice.compact.clone.live`
  3. `leeway.voice.branded.live`
  4. `leeway.voice.text.emergency`

## Operating Rule

Before changing Agent Lee voice code:

1. Load the live voice manifest.
2. Verify no non-LeeWay engine is configured as the default route.
3. Verify no external provider is enabled for normal operation.
4. Verify the route manager can explain why a route was selected or rejected.
5. If no LeeWay-owned live route is healthy, degrade to `leeway.voice.text.emergency`.
6. Surface truthful runtime diagnostics instead of pretending speech succeeded.

## Verification

Run:

```bash
npm run compile
npm run LEEWAY_CONSTRUCTION_LAW_GATE
powershell -File .\scripts\Invoke-LeeWayApplicationIdentityGraphGate.ps1
npm run LEEWAY_APPLICATION_INTEGRITY_GATE
npx vsce package --allow-star-activation
```

Also verify dynamic voice truth:

- active manifest loads
- no non-LeeWay engine is configured as default
- no non-LeeWay engine is selected during normal fallback
- external providers are rejected
- primary clone route wins when healthy
- compact clone route wins when primary fails
- branded route wins when compact is unavailable
- text emergency activates when live LeeWay routes are unavailable
- one-word failure is detected and recorded
- voice failures produce visible truthful diagnostics
