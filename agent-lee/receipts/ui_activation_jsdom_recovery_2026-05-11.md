<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: CORE
TAG: CORE.RECEIPT.UI.ACTIVATION.JSDOM.RECOVERY
DISCOVERY_PIPELINE: Voice -> Intent -> Location -> Vertical -> Ranking -> Render
-->

# Receipt: Agent Lee activation recovery from jsdom crash

## Status
Verified locally on May 11, 2026.

## Root cause
The extension host log at `C:\Users\Leona\AppData\Roaming\Code\logs\20260511T065938\window1\exthost\exthost.log` showed Agent Lee failing during activation on May 11, 2026 at 06:59:46 with:

`ENOENT: no such file or directory, open 'c:\Users\Leona\.vscode\browser\default-stylesheet.css'`

That failure originated from `jsdom` being loaded on the main extension activation path through `src/visual-intelligence/visualRuntime.ts`. Because activation crashed early, the real Agent Lee chat sidebar never hydrated, the status bar item never appeared, and the left sidebar stayed blank.

## Edits applied
1. Removed the top-level `jsdom` import from `src/visual-intelligence/visualRuntime.ts`.
2. Switched SVG validation to lazy-load `jsdom` only when `validateSvgXml()` is called.
3. Added `jsdom` to the esbuild `external` list in `scripts/bundle-extension.mjs` so it stays out of the startup bundle.

## Commands run
1. `npm run compile`
2. `npx vsce package`
3. `code.cmd --install-extension "C:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\agent-lee-leeway-coding-system-1.1.8.vsix" --force`
4. `Select-String -Path dist\extension.js -Pattern 'default-stylesheet.css','require("jsdom")'`

## Verification
1. `npm run compile` passed.
2. `npx vsce package` passed and produced `agent-lee-leeway-coding-system-1.1.8.vsix`.
3. The VSIX reinstall succeeded.
4. The compiled `dist/extension.js` no longer contains the old `default-stylesheet.css` crash marker or an eager `require("jsdom")` startup path.
