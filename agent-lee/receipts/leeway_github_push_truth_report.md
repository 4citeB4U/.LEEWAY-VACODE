<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RUNTIME.EXTENSION.GITHUB_PUSH_TRUTH_REPORT
PURPOSE: Proves whether the LeeWay VS Code project was actually published to the expected GitHub remote and explains branch visibility truthfully.
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# LeeWay GitHub Push Truth Report

## Local State

- Local branch: `codex-publish-leeway-system`
- Local HEAD: `db38e4f0fd8d498d8893216ad8e2f8ad81bc5226`
- Commit `db38e4f` exists locally: `Yes`
- Working tree clean: `No`
- Working tree reason: `Post-push compile and runtime evidence refresh rewrote evidence artifacts.`

## Remote State

- Remote URL: `https://github.com/4citeB4U/.LEEWAY-VACODE.git`
- Remote branch exists: `Yes`
- Remote branch: `origin/codex-publish-leeway-system`
- Remote branch commit: `db38e4f0fd8d498d8893216ad8e2f8ad81bc5226`
- Local and remote branch match: `Yes`
- Remote `main` commit: `735442601bb6e79db47eec91a92cb087f7ea8809`
- Updates are on `main`: `No`
- PR required for `main` to show these updates: `Yes`

## LFS Truth

- Git LFS tracking active: `Yes`
- LFS-tracked file: `knowledge/knowledge.jsonl`
- LFS upload status: `Clean`
- Commit contains LFS pointer instead of full file: `Yes`

## Proof Commands

- `git push -u origin codex-publish-leeway-system`
  Output: `branch 'codex-publish-leeway-system' set up to track 'origin/codex-publish-leeway-system'. Everything up-to-date`
- `git ls-remote origin codex-publish-leeway-system`
  Output: `db38e4f0fd8d498d8893216ad8e2f8ad81bc5226 refs/heads/codex-publish-leeway-system`
- `git ls-remote origin main`
  Output: `735442601bb6e79db47eec91a92cb087f7ea8809 refs/heads/main`

## Why GitHub May Look Unchanged

1. The updates were pushed to `codex-publish-leeway-system`, not `main`.
2. GitHub defaults to `main`, so the website will still show the older `main` branch unless the branch selector is changed or a PR is opened.
3. The earlier 100 MB blocker was resolved by moving `knowledge/knowledge.jsonl` into Git LFS before the successful push.

## Next Step

- Compare URL: `https://github.com/4citeB4U/.LEEWAY-VACODE/compare/main...codex-publish-leeway-system`

## Verdict

- Final verdict: `PARTIAL_PUSHED_BRANCH_NOT_MAIN`