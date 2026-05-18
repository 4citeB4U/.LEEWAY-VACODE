<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.EXTENSION_RUNTIME_TRUTH
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Defines LeeWay extension runtime truth requirements so source, packaged, and stale installs cannot be confused.
-->

# LeeWay Extension Runtime Truth Law

## Law
- LAW-0020: Extension Runtime Truth
- Every LeeWay-governed VS Code extension must classify the active runtime source before claiming readiness.
- Required source modes:
  - `SOURCE_DEV_HOST`
  - `SOURCE_LINKED_WORKSPACE`
  - `SOURCE_PACKAGED_VSIX`
  - `SOURCE_STALE_VSIX`
  - `SOURCE_UNKNOWN`
- The runtime must surface whether commands are registered, whether required assets are present, whether build info exists, and whether the running build matches the current source workspace.
- A stale installed VSIX must be visible as degraded or stale runtime truth, not silently treated as current.
- Release packaging must ship build info, README assets, package metadata, and the compiled entrypoint.
- Source development must prefer Extension Development Host over reinstalling VSIX builds during normal iteration.

## Required evidence
- Build info artifact for the current source compile.
- Packaged VSIX inspection evidence.
- Installed extension attestation evidence.
- UI/runtime status evidence exposing source mode and stale drift.
