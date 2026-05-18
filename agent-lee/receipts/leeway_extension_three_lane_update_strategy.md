<!--
LEEWAY_HEADER - DO NOT REMOVE
REGION: 🟢 CORE
TAG: CORE.RUNTIME.EXTENSION.UPDATE_STRATEGY
DISCOVERY_PIPELINE: Voice → Intent → Location → Vertical → Ranking → Render
PURPOSE: Document the three distinct update paths for Agent Lee, why each exists, and which to use when.
-->

# Agent Lee Extension: Three-Lane Update Strategy

**Document Version**: 1.0  
**Last Updated**: 2026-05-17  
**Status**: Authoritative

---

## Why Three Lanes?

Because this extension is currently **side-loaded from a local VSIX**, not published to a marketplace. VS Code has no automatic update channel for local side-loaded extensions. We therefore need three separate deployment strategies:

1. **Lane A**: Development iteration (SOURCE_DEV_HOST)
2. **Lane B**: Local release testing and manual updates (LOCAL_RELEASE_VSIX)
3. **Lane C**: Future marketplace auto-updates (PUBLISHED_UPDATE_CHANNEL)

---

## Lane A: SOURCE_DEV_HOST

**When to use**: While coding Agent Lee features, debugging, or iterating on the extension itself.

**How it works**:
1. Open VS Code in the extension workspace: `code c:\Users\Leona\.leeway-vscode\agent-lee\vscode-extension`
2. Press `F5` to launch Extension Development Host
3. A new VS Code window opens with the latest source code loaded
4. Changes to source files automatically reload the extension (live reload)
5. No VSIX packaging needed
6. Test your changes immediately

**Pros**:
- Fastest iteration loop
- No packaging overhead
- Live reload on file save
- Easiest debugging

**Cons**:
- Only works for development
- Cannot test as an actual installed extension
- Extension terminates when dev host closes

**Update Lane ID**: `UPDATE_CHANNEL_DEV_HOST`

---

## Lane B: LOCAL_RELEASE_VSIX

**When to use**: 
- Testing a release candidate before publishing
- Deploying to your own VS Code without marketplace access
- Validating that VSIX packaging works correctly

**How it works**:

### Step 1: Build the VSIX
```powershell
cd agent-lee\vscode-extension
npm run compile
npm run package
```

This creates: `agent-lee-leeway-coding-system-X.Y.Z.vsix`

### Step 2: Install using the automated install script
```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File "scripts\Invoke-LeeWayExtensionInstallCurrent.ps1"
```

This script:
- Finds the latest built VSIX
- Uninstalls all old Agent Lee versions
- Installs the new VSIX using VS Code CLI (if available) or manual extraction
- Verifies installation
- Writes evidence JSON

### Step 3: Reload VS Code
Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (macOS) to reload the window.

### Step 4: Verify
- Check Activity Bar for Agent Lee icon
- Click icon to open sidebar
- Verify status bar shows "Agent Lee: Ready"
- Test any commands

**Pros**:
- Tests real VSIX as users would receive it
- Can be repeated for each new version
- Completely manual — no automation failures
- Deterministic and reproducible

**Cons**:
- Manual process each time
- Requires VS Code reload after each install
- No automatic updates
- Not suitable for end-user auto-update

**Update Lane ID**: `UPDATE_CHANNEL_MANUAL_LOCAL_VSIX`

**Note**: This is the ONLY working "update" path for side-loaded extensions. Clicking "Auto Update" in VS Code will have no effect on this extension unless it is published to a marketplace.

---

## Lane C: PUBLISHED_UPDATE_CHANNEL

**Status**: FUTURE / NOT YET IMPLEMENTED

**When to use**: Once Agent Lee is published to a marketplace registry and users expect automatic updates.

**How it would work**:

### Option 1: VS Code Marketplace (Microsoft)
- Publish to: https://marketplace.visualstudio.com/
- Requires: Microsoft account, publisher registration, review process
- Then: Users get auto-updates through VS Code's marketplace mechanism
- Update Lane ID: `UPDATE_CHANNEL_MARKETPLACE`

### Option 2: Open VSX (Community)
- Publish to: https://open-vsx.org/
- Requires: OpenVSX account, namespace verification
- Then: Users get auto-updates through Open VSX registry
- Update Lane ID: `UPDATE_CHANNEL_OPEN_VSX`

### Option 3: Custom Registry
- Set up private extension registry
- Publish Agent Lee versions to it
- Users configure VS Code to use custom registry
- Update Lane ID: `UPDATE_CHANNEL_CUSTOM_REGISTRY`

**Prerequisites for any marketplace**:
- Extension must be listed publicly
- Extension ID / publisher must be stable
- Version numbering must follow semver
- Marketplace will NOT auto-update side-loaded VSIX installs; users must uninstall side-loaded version first

**Why not done yet**:
- Requires marketplace account setup
- Requires review/approval process
- Requires versioning discipline
- Future LeeWay decision

---

## Decision Tree: Which Lane Should I Use?

```
Are you coding Agent Lee features?
├─ YES → Use Lane A (F5 / Extension Development Host)
└─ NO
   │
   Are you testing a release candidate or deploying locally?
   ├─ YES → Use Lane B (Invoke-LeeWayExtensionInstallCurrent.ps1)
   └─ NO
      │
      Has Agent Lee been published to a marketplace?
      ├─ YES → Auto-updates work (Lane C; check marketplace for updates)
      └─ NO → You're using Lane B (side-loaded VSIX); manual install only
```

---

## Auto-Update Reality for Side-Loaded Extensions

### Current State
- Extension is **side-loaded** from local VSIX
- VS Code's "Auto Update" toggle applies to **published marketplace extensions only**
- For side-loaded extensions, auto-update **has no effect**
- This is **not a bug** in VS Code; it's how extensions are designed

### Why Clicking "Auto Update" Does Nothing
1. User clicks "Auto Update" in VS Code Extensions view
2. VS Code looks for the extension in its connected marketplaces (Marketplace, Open VSX, etc.)
3. Extension not found in any marketplace
4. VS Code cannot detect newer versions (nothing to search)
5. No update available → setting is remembered but has no effect
6. When VS Code next checks for updates, same result: not found

### How to Actually Update
**Only manual options work for side-loaded extensions**:

1. **Option 1**: Use Lane B (Invoke-LeeWayExtensionInstallCurrent.ps1)
   - Automatic uninstall of old version
   - Automatic install of latest local VSIX
   - Guided and reproducible

2. **Option 2**: Manual uninstall + install
   - Uninstall old Agent Lee in Extensions view
   - Install new .vsix via `code --install-extension <path>`
   - Reload VS Code

3. **Option 3**: Use Extension Development Host (Lane A)
   - F5 to run latest source code
   - No install required

---

## Extension Update Mode Detection

The extension runtime will detect and report its update channel:

```typescript
export enum UpdateChannel {
  DEV_HOST = "UPDATE_CHANNEL_DEV_HOST",
  MANUAL_LOCAL_VSIX = "UPDATE_CHANNEL_MANUAL_LOCAL_VSIX",
  MARKETPLACE = "UPDATE_CHANNEL_MARKETPLACE",
  OPEN_VSX = "UPDATE_CHANNEL_OPEN_VSX",
  UNKNOWN = "UPDATE_CHANNEL_UNKNOWN"
}
```

At activation, the extension will:
1. Detect its installation source
2. Determine which update channel is available
3. Show status in Runtime Health (status bar + diagnostic command)
4. Provide appropriate update guidance

**Status Bar Display**:
```
Agent Lee: Ready (updates: manual local VSIX)
Agent Lee: Ready (updates: auto - marketplace)
Agent Lee: Ready (updates: dev host only)
```

---

## Updating Agent Lee: Checklists

### For Developers (Using Lane A)

- [ ] Make code changes
- [ ] Save file (auto-reload watches extension)
- [ ] Test in Extension Development Host (F5 window)
- [ ] Verify no errors in Extension Output
- [ ] Run gates/tests before committing

### For Release Testing (Using Lane B)

- [ ] Commit code to source
- [ ] Update `package.json` version number
- [ ] Run gates: `npm run compile`, `npm run package`
- [ ] Verify `agent-lee-leeway-coding-system-X.Y.Z.vsix` exists
- [ ] Run install script: `Invoke-LeeWayExtensionInstallCurrent.ps1`
- [ ] Reload VS Code (Ctrl+R)
- [ ] Verify new version in Extensions view
- [ ] Test all critical features
- [ ] Document any issues in receipts

### For Published Marketplace (Using Lane C - Future)

- [ ] All Lane B steps
- [ ] Publish to marketplace (manual, one-time setup)
- [ ] Users then see auto-updates in VS Code
- [ ] No user action needed after first install

---

## Troubleshooting Update Issues

**Problem**: "Auto Update is enabled but extension doesn't update"  
**Cause**: Extension is side-loaded (not in marketplace)  
**Solution**: Use Lane B install script or manual install

**Problem**: "Multiple Agent Lee versions show in Extensions view"  
**Cause**: Old versions not fully uninstalled  
**Solution**: Manually remove all old `leeway.agent-lee-leeway-coding-system-*` folders from `~/.vscode/extensions/`

**Problem**: "Extension still shows old version after installing new VSIX"  
**Cause**: VS Code cached old version; window not reloaded  
**Solution**: Reload VS Code (Ctrl+R) or restart VS Code completely

**Problem**: "Install script fails with 'VS Code CLI not found'"  
**Cause**: `code` command not in PATH  
**Solution**: Either add VS Code to PATH, or script falls back to manual extraction

**Problem**: "Sidebar doesn't open after update"  
**Cause**: Extension not fully activated; old extension still in memory  
**Solution**: Close ALL VS Code windows, wait 5 seconds, reopen

---

## Validation: How to Know Update Worked

After installing/updating Agent Lee:

```powershell
# 1. Check installed folder
ls ~/.vscode/extensions/leeway.agent-lee-leeway-coding-system-*/

# 2. Check package.json version
cat ~/.vscode/extensions/leeway.agent-lee-leeway-coding-system-*/package.json | grep version

# 3. Check source version
cat agent-lee\vscode-extension\package.json | grep version

# 4. Run installed extension check
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File "agent-lee\vscode-extension\scripts\Invoke-LeeWayInstalledExtensionCheck.ps1"
```

**Expected result**: Installed version matches source version, `staleDetected: false`

---

## Summary Table

| Aspect | Lane A (Dev Host) | Lane B (Local VSIX) | Lane C (Marketplace) |
|--------|-------------------|-------------------|----------------------|
| **Use Case** | Coding | Testing & local deploy | End-user auto-update |
| **Update Mode** | Auto-reload | Manual install | Auto-update |
| **Command** | F5 | Install script | Marketplace auto-update |
| **Frequency** | Every file save | Per release | Automatic |
| **User Experience** | Developer | Manual | Transparent |
| **Status** | Available now | Available now | Future |
| **Lane ID** | DEV_HOST | MANUAL_LOCAL_VSIX | MARKETPLACE |

---

## Going Forward

- [ ] **Now**: Lane A & B work; Lane C still needs marketplace setup
- [ ] **Later**: Decide on Lane C marketplace (VS Code Marketplace vs. Open VSX)
- [ ] **Eventually**: If Lane C adopted, update install docs and publish pipeline

Until Lane C is implemented, **Lane B is the standard update path for non-developers**.

---

**Document Owner**: Agent Lee Runtime  
**Next Review**: When marketplace publication is decided  
**Related Files**:
- `agent-lee/vscode-extension/scripts/Invoke-LeeWayExtensionInstallCurrent.ps1`
- `agent-lee/vscode-extension/src/core/extensionRuntimeTruth.ts`
- `agent-lee/vscode-extension/package.json`
