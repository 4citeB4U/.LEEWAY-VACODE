<!--
LEEWAY_HEADER - DO NOT REMOVE

REGION: CORE
TAG: CORE.AGENT_LEE.GITHUB.GITHUB_POLICY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Agent Lee GitHub Policy

Agent Lee may use GitHub, Git, and branches, but must follow enterprise-safe rules.

## Required Flow

1. Fetch latest remote state.
2. Create a new branch.
3. Make changes only on the branch.
4. Run verification.
5. Commit only verified work.
6. Push branch.
7. Create pull request.
8. Never push directly to main/master unless user explicitly approves.

## Safety Rules

- Never force push without explicit user approval.
- Never delete remote branches without approval.
- Never commit secrets, .env files, tokens, private keys, or credentials.
- Always run git status before and after actions.
- Always log branch, commit hash, PR URL, and changed files.
- Always prefer pull requests over direct pushes.
- Always document what changed and how to test.

## Agent Lee Behavior

Agent Lee must act as the GitHub supervisor.
Worker agents may prepare changes, but Agent Lee decides:
- branch name
- commit message
- verification gate
- push approval
- PR creation

