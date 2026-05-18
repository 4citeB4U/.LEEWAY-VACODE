# Edit Receipt - Logo Fix

## Description
Replaced all placeholder SVG logos in the Agent Lee chat interface with the authentic PNG versions provided in the repository.

## Changes
- **extension.ts**:
    - Updated `brandingIconUri` to point to `top-right-button.png`.
    - Updated `standardsBtnUri` to point to `leeway-standards-button.png`.
    - Added `bottomBtnUri` pointing to `bottom-button.png`.
    - Updated webview HTML to use these PNG assets.
    - Fixed the footer button to use the specific `bottom-button.png` instead of sharing the top-right branding icon.
- **package.json**:
    - Updated the activity bar icon to use `leeway-standards-button.png`.
- **Cleanup**:
    - Deleted `media/agent-lee-activitybar.svg`
    - Deleted `media/leeway-standards-activitybar.svg`
    - Deleted `media/leeway-standards-button.svg`

## Verification
- Ran `npm run compile` - Success.
- Verified file presence in `media/` directory.

## Status
✅ Complete
