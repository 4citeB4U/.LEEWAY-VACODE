<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: 🟢 CORE
TAG: CORE.VOICE.LOCK.MAIN
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
PURPOSE: Locked voice selection and playback tuning record for Agent Lee local speech runtime.
-->

## Agent Lee Voice Lock

Agent Lee's locked default voice is `en_US-arctic-medium` with speaker lane `fem`.

This voice is the current law for local Piper playback in the Agent Lee app unless an explicit re-audition replaces it.

### Locked Runtime

- Runtime config: [voice-runtime.json](/abs/c:/Users/Leona/.leeway-vscode/agent-lee/voice/voice-runtime.json)
- Speech pipeline: [Speak-AgentLeePiper.ps1](/abs/c:/Users/Leona/.leeway-vscode/agent-lee/voice/Speak-AgentLeePiper.ps1)
- Model file: `C:\Users\Leona\.leeway-vscode\agent-lee\voice\models\en_US-arctic-medium.onnx`
- Config file: `C:\Users\Leona\.leeway-vscode\agent-lee\voice\models\en_US-arctic-medium.onnx.json`
- Selected speaker lane: `fem`

### Locked Tuning

- `selectedVoiceId`: `en_US-arctic-medium`
- `selectedVoiceLabel`: `Agent Lee Female Voice - Arctic FEM`
- `selectedSpeakerId`: `fem`
- `sampleTrimRatio`: `0.95`
- `playbackRateRatio`: `0.95`

### Reference Audition

The accepted audition sound was captured as:

- `C:\Users\Leona\AppData\Local\Temp\agent-lee-audition-arctic-fem.wav`

### Rule

If Agent Lee voice playback is rebuilt, migrated, or repaired later, preserve this same voice ID and tuning unless the user explicitly approves a new audition winner.
