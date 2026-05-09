<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: 🟢 CORE
TAG: CORE.VOICE.LOCK.MAIN
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
PURPOSE: Locked voice selection and playback tuning record for Agent Lee local speech runtime.
-->

## Agent Lee Voice Lock

Agent Lee's locked default voice is `en_US-norman-medium`.

This voice is the current law for local Piper playback in the Agent Lee app unless an explicit re-audition replaces it.

### Locked Runtime

- Runtime config: [voice-runtime.json](/abs/c:/Users/Leona/.leeway-vscode/agent-lee/voice/voice-runtime.json)
- Speech pipeline: [Speak-AgentLeePiper.ps1](/abs/c:/Users/Leona/.leeway-vscode/agent-lee/voice/Speak-AgentLeePiper.ps1)
- Model file: `C:\Users\Leona\.leeway-vscode\agent-lee\voice\models\en_US-norman-medium.onnx`
- Config file: `C:\Users\Leona\.leeway-vscode\agent-lee\voice\models\en_US-norman-medium.onnx.json`

### Locked Tuning

- `selectedVoiceId`: `en_US-norman-medium`
- `selectedVoiceLabel`: `Agent Lee Locked Voice - Norman`
- `sampleTrimRatio`: `0.95`
- `playbackRateRatio`: `0.9116`

### Reference Audition

The accepted audition sound was captured as:

- `C:\Users\Leona\AppData\Local\Temp\agent-lee-audition-norman-frequency-corrected.wav`

### Rule

If Agent Lee voice playback is rebuilt, migrated, or repaired later, preserve this same voice ID and tuning unless the user explicitly approves a new audition winner.
