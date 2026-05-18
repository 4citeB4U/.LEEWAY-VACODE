<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: 🟢 CORE
TAG: CORE.RUNTIME.EXTENSION.CRITICAL_NEXT_STEPS
PURPOSE: Tell user exactly what to do right now to get the extension working.
-->

# ⚠️ CRITICAL: What To Do Right Now

## Status

✓ **DONE**: Version 1.2.9 installed to ~/.vscode/extensions/  
✓ **DONE**: Stale 1.2.6 removed  
✓ **DONE**: All assets verified present  

⏳ **PENDING**: You must reload VS Code to activate it  

---

## 🔴 DO THIS NOW

### 1. Reload VS Code

**Keyboard Shortcut**:
- **Windows/Linux**: Press `Ctrl + R`
- **macOS**: Press `Cmd + R`

**Alternative**: Restart VS Code completely by closing and re-opening

**Wait**: 5-10 seconds for reload to complete

---

### 2. Verify The Extension Works

After reload, you should see:

| Item | Expected | Where |
|------|----------|-------|
| **Icon** | Agent Lee icon visible | **Activity Bar** (left sidebar) - should NOT be gray |
| **Status** | "Agent Lee: Ready" | **Status Bar** (bottom right) - should show ready status |
| **Click Test** | Icon opens sidebar | Click the Agent Lee icon → sidebar should open |
| **Command** | Command works | Open Command Palette (Ctrl+Shift+P) → type "Agent Lee: Open Sidebar" → should work |

---

### 3. If It Works ✓

**Congratulations!** The extension is now operational.

**All three yellow-circle problems are fixed**:
- ✓ Activity Bar icon is visible (not gray)
- ✓ Sidebar opens when you click it
- ✓ Status bar shows "Agent Lee: Ready"
- ✓ No more "command 'agentLee.openSidebar' not found" error

**Next**: Use the extension normally. Development can continue.

---

### 4. If It Still Doesn't Work ✗

**Troubleshooting**:

#### Step 1: Check Extension Output for Errors

```
View Menu
  ↓ Output
    ↓ Select "Agent Lee" from dropdown
```

Look for red error messages starting with `[ERROR]` or `Cannot find module`.

**Common errors**:
- `Cannot find module './adapters/...'` → Missing adapter file (should not happen - report this)
- `Command agentLee.openSidebar not found` → Extension didn't fully activate
- Syntax errors → Source code issue

#### Step 2: Verify Installation

Run this PowerShell command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File "c:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\scripts\Invoke-LeeWayInstalledExtensionCheck.ps1"
```

This will tell you:
- Installed version
- Source version
- Whether they match
- Which files are missing
- Whether the extension is stale

#### Step 3: Hard Reset

If it still doesn't work:

1. **Close ALL VS Code windows** completely
2. **Wait 5 seconds**
3. **Delete the extension folder manually**:
   ```powershell
   Remove-Item "$env:USERPROFILE\.vscode\extensions\leeway.agent-lee-leeway-coding-system-*" -Recurse -Force
   ```
4. **Re-run install script**:
   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass `
     -File "c:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\scripts\Invoke-LeeWayExtensionInstallCurrent.ps1"
   ```
5. **Restart VS Code completely**

#### Step 4: Report The Problem

If it still doesn't work after hard reset, save the output and report:
- VS Code version
- Extension Output errors (paste the [ERROR] lines)
- Result of `Invoke-LeeWayInstalledExtensionCheck.ps1`
- Which step failed

---

## 📋 Verification Checklist

Use this to confirm everything is working:

```
After reloading VS Code:

[ ] Activity Bar icon is visible (left sidebar, below file explorer)
[ ] Activity Bar icon is NOT gray/blank (it's the LeeWay mark/color)
[ ] Click icon → sidebar opens with Agent Lee interface
[ ] Status bar (bottom right) shows "Agent Lee: Ready"
[ ] Command palette: Ctrl+Shift+P → type "Agent Lee" → see "Agent Lee: Open Sidebar" command
[ ] Run command → sidebar opens
[ ] Extension Output (View > Output) shows no [ERROR] messages
[ ] README displays in Extension Details with images

If ALL checked: ✓✓✓ Extension is working perfectly
If SOME unchecked: Troubleshoot that specific item
If ALL unchecked: Run hard reset (Step 3 above)
```

---

## 🔧 What Was Installed

**Old (Stale - Removed)**:
- leeway.agent-lee-leeway-coding-system-1.2.6
- Location: ~/.vscode/extensions/leeway.agent-lee-leeway-coding-system-1.2.6/ → ❌ DELETED

**New (Current)**:
- leeway.agent-lee-leeway-coding-system-1.2.9  
- Location: ~/.vscode/extensions/leeway.agent-lee-leeway-coding-system-1.2.9/ → ✓ ACTIVE
- Adapters: gmail, huggingface, vercel → ✓ ALL PRESENT
- Assets: icon, button, README → ✓ ALL PRESENT

---

## 📌 Known Limitation: Auto-Update

**Important**: This extension **will NOT auto-update** through VS Code's automatic update mechanism.

**Why?** Agent Lee is installed from a local VSIX file, not from VS Code Marketplace. VS Code's auto-update only works for marketplace extensions.

**How to update in the future**:

Run this command to automatically install the latest local VSIX:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File "c:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension\scripts\Invoke-LeeWayExtensionInstallCurrent.ps1"
```

See: [Three-Lane Update Strategy](leeway_extension_three_lane_update_strategy.md) for full details.

---

## 📚 Evidence & Documentation

All installation evidence is saved here:

```
~/.leeway-vscode/agent-lee/vscode-extension/test-evidence/
  ├─ leeway-extension-install-current-result.json     (Installation results)
  └─ [other verification files]

~/.leeway-vscode/agent-lee/receipts/
  ├─ RUNTIME_STATUS_TRUTH_2026-05-17.md               (Current state)
  ├─ INSTALLATION_VERIFICATION_1_2_9_2026-05-17.md   (What was installed)
  ├─ AUTO_UPDATE_ROOT_CAUSE_ANALYSIS_2026-05-17.md   (Why auto-update doesn't work)
  ├─ leeway_extension_three_lane_update_strategy.md   (How to update going forward)
  └─ [other documentation]
```

---

## ✅ Summary

| Phase | Status | Action |
|-------|--------|--------|
| Source code fix | ✓ COMPLETE | 1.2.9 built and verified |
| VSIX build | ✓ COMPLETE | agent-lee-leeway-coding-system-1.2.9.vsix created |
| Stale version removed | ✓ COMPLETE | 1.2.6 deleted from extensions/ |
| New version installed | ✓ COMPLETE | 1.2.9 installed and verified |
| **VS Code reload** | 🔴 **DO THIS NOW** | Press Ctrl+R to activate |
| Icon visible | ⏳ PENDING | After reload |
| Sidebar works | ⏳ PENDING | After reload |
| Status bar ready | ⏳ PENDING | After reload |

---

## 🎯 Final Verification Will Confirm

Once you reload and verify the checklist above, the extension will be:

- ✓ **Fixed** in source code (1.2.9)
- ✓ **Installed** in your VS Code (1.2.9)
- ✓ **Working** in the running extension (visible, clickable, responsive)
- ✓ **Documented** (why auto-update doesn't persist, how to update)
- ✓ **Verified** (all gates pass, all assets present, no adapters crash)

---

## Questions?

**Q: How long does reload take?**  
A: Usually 5-10 seconds. Wait until you see the sidebar interface fully load.

**Q: Does reload lose my work?**  
A: No. Reload only restarts the extension; your open files/workspace remain untouched.

**Q: Can I use the extension in dev mode instead?**  
A: Yes! Press F5 in the extension source folder to use Extension Development Host. See: [Three-Lane Update Strategy](leeway_extension_three_lane_update_strategy.md)

**Q: What if the icon is still tiny/gray after reload?**  
A: That's a UI asset problem (Phase 6). The extension functions, but the icon needs visual fixing. Report this and we'll replace the icon SVG.

---

**Generated**: 2026-05-17 13:10 AM  
**Action Required**: Reload VS Code (Ctrl+R) and verify checklist  
**Estimated Time to Completion**: 5-10 seconds  
**Next Report**: After you reload and confirm working status
