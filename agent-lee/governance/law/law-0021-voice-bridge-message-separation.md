<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.VOICE_BRIDGE_MESSAGE_SEPARATION
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Governs LeeWay Voice message separation, truthful degradation, and owner-safe voice intake.
-->

# LAW-0021 Voice Bridge Message Separation

Voice bridge status, heartbeat, errors, and transcripts must be classified separately.

Status and heartbeat messages must never be injected into the user or assistant chat stream.

Only verified voice transcripts may enter the governed chat input flow.

Rules:
- no heartbeat-to-chat
- no status-to-chat
- no repeated readiness messages
- no automatic command execution from voice without owner confirmation
- no speech transcript mutation without proposal or approval where applicable
- voice input must carry source, transcript ID, timestamp, and confidence where available
- fallback must be labeled truthfully
- no fallback may pretend to be full LeeWay Voice authority
