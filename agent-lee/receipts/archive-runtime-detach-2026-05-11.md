<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.ARCHIVE.RUNTIME_DETACH
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Archive Runtime Detach

## Status
Completed: removed `_archive/` as a published runtime dependency and kept it only as local backup output material.

## Edits
1. Updated `agent-lee/voice/Start-AgentLeeVoiceServer.ps1` to launch the owned local voice service through `Start-AgentLeeCloneVoiceServer.ps1` instead of searching archived pre-standalone snapshots.
2. Updated `agent-lee/voice/Test-AgentLeeVoiceServer.ps1` to verify the owned local voice service `/health` endpoint from `voice-runtime.json`.
3. Updated `.gitignore` to ignore `_archive/` so backup snapshots stop appearing as repo content.
4. Updated `README.md` to document `_archive/` as local backup material, not published source of truth.

## Verification
1. `Start-AgentLeeVoiceServer.ps1` no longer references `_archive/`.
2. The only remaining `_archive/` reference in active scripts is `Convert-AgentLeeToStandalone.ps1`, where it remains the intended backup destination.
3. `_archive/` can be removed from the Git index without removing the local backup folders from disk.

## Notes
1. `Convert-AgentLeeToStandalone.ps1` was intentionally left using `_archive/` for local backup creation.
2. The full standalone migration script was not executed as part of this change because it can delete the external `LeeWay-Standards` folder when its gates pass.
