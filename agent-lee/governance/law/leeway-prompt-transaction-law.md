<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.GOVERNANCE.LAW.PROMPT_TRANSACTION
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
PURPOSE: Defines LeeWay prompt, intent, and transaction traceability law.
-->

# LeeWay Prompt Transaction Law

Every meaningful prompt, instruction, or external input must receive a LeeWay prompt ID before it can become LeeWay action.

Every action attempt must receive a LeeWay transaction ID before it touches a file, command, event, gate, package, evidence record, or receipt.

## Prompt ID Format

`LEEWAY_PROMPT::<SOURCE>::<TYPE>::<HASH>`

## Transaction ID Format

`LEEWAY_TX::<DOMAIN>::<ACTION>::<UTC_TIMESTAMP>::<SHORT_HASH>`

## Required Transaction Links

Each transaction must reference:

- actor ID
- intent ID
- prompt ID
- authority ID
- node ID
- file IDs
- gate IDs
- evidence IDs
- receipt IDs
- result

No LLM output may become LeeWay action until it has passed through a LeeWay Agent transaction with actor ID, prompt ID, intent ID, authority check, graph mapping, gate verification, evidence, and receipt.
