<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: 🟢 CORE
TAG: CORE.VOICE.LOCK.MAIN
DISCOVERY_PIPELINE:
  Voice → Intent → Location → Vertical → Ranking → Render
PURPOSE: Locked voice selection and playback tuning record for Agent Lee local speech runtime.
-->

## Agent Lee Voice Lock

Agent Lee's locked default voice is `en_US-hfc_male-medium`.

This voice is the current law for local Piper playback in the Agent Lee app unless an explicit re-audition replaces it.

### Locked Runtime

- Runtime config: [voice-runtime.json](/abs/c:/Users/Leona/.leeway-vscode/agent-lee/voice/voice-runtime.json)
- Speech pipeline: [Speak-AgentLeePiper.ps1](/abs/c:/Users/Leona/.leeway-vscode/agent-lee/voice/Speak-AgentLeePiper.ps1)
- Model file: `C:\Users\Leona\.leeway-vscode\agent-lee\voice\models\en_US-hfc_male-medium.onnx`
- Config file: `C:\Users\Leona\.leeway-vscode\agent-lee\voice\models\en_US-hfc_male-medium.onnx.json`
- Selected speaker lane: default model lane

### Locked Tuning

- `selectedVoiceId`: `en_US-hfc_male-medium`
- `selectedVoiceLabel`: `Agent Lee Male Voice - HFC`
- `selectedSpeakerId`: default model lane
- `sampleTrimRatio`: `0.95`
- `playbackRateRatio`: `0.95`

### Reference Audition

The accepted runtime target is now the packaged validation male model path expected by the product docs.

### Rule

If Agent Lee voice playback is rebuilt, migrated, or repaired later, preserve this same voice ID and tuning unless the user explicitly approves a new audition winner.
