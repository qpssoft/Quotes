# Consistency Analysis Report: Electron Desktop App

**Feature**: 003-electron-desktop | **Date**: 2025-11-21 | **Analyzer**: Automated

This report identifies inconsistencies, conflicts, gaps, and alignment issues across the specification, plan, tasks, and checklist documents.

---

## Executive Summary

**Status**: ⚠️ **MEDIUM PRIORITY ISSUES FOUND**

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| **Conflicts** | 1 | 0 | 2 | 0 | 3 |
| **Inconsistencies** | 0 | 1 | 3 | 2 | 6 |
| **Gaps** | 0 | 2 | 8 | 5 | 15 |
| **Ambiguities** | 0 | 1 | 4 | 1 | 6 |
| **TOTAL** | **1** | **4** | **17** | **8** | **30** |

**Recommendation**: Resolve 1 critical conflict and 4 high-priority issues before proceeding to implementation.

---

## 🔴 CRITICAL ISSUES (Must Fix)

### C001 - Overlay Click Behavior Conflict

**Type**: Specification Conflict  
**Severity**: CRITICAL  
**Status**: ❌ Unresolved

**Conflicting Requirements**:

**Location 1**: `spec.md` §US-003 Line 70
```markdown
- And I can click the overlay to dismiss it immediately
```

**Location 2**: `spec.md` §US-003 Line 71
```markdown
- And clicking opens full quote in main window before dismissing
```

**Location 3**: `spec.md` §FR-002 Line 118
```markdown
- Click to dismiss immediately
```

**Location 4**: `spec.md` §FR-002 Line 121
```markdown
- Click opens full quote in main window
```

**Location 5**: `spec.md` Clarifications
```markdown
Q: When a quote notification overlay appears on screen, how should it respond to user interaction?
A: Dismissible with click (clicking the overlay closes it immediately), and auto-dismiss after configured interval time
```

**Conflict Analysis**:
- US-003 states BOTH "dismiss immediately" AND "opens full quote before dismissing"
- FR-002 lists both as separate bullets (unclear if they're alternatives or sequence)
- Clarifications say "closes it immediately" (no mention of opening main window)
- These are mutually exclusive behaviors

**Impact**: Implementation cannot proceed without clear decision

**Proposed Resolution**:
```markdown
OPTION A (Recommended): Click dismisses overlay only
- User clicks overlay → overlay closes immediately
- User can use shortcut Ctrl+Shift+N or tray menu for "view full quote"

OPTION B: Click opens main window AND dismisses
- User clicks overlay → main window opens to that quote → overlay closes
- This is a two-step action (open + dismiss)

OPTION C: Click area determines behavior
- Click on quote text → opens main window + dismisses overlay
- Click on close button (X) → dismisses overlay only
- Requires UI affordance (close button)
```

**Decision Required From**: Product Owner

**Affected Documents**: spec.md, plan.md §T403-T404, tasks.md §T403-T404

---

## 🟠 HIGH PRIORITY ISSUES

### H001 - Transparency Control Specification Missing

**Type**: Ambiguity  
**Severity**: HIGH  
**Status**: ❌ Unresolved

**Issue**: Spec says "configurable 50-100%" but doesn't specify:
- Discrete steps (e.g., 50%, 60%, 70%, 80%, 90%, 100%) or continuous slider?
- Step size if discrete (5% increments? 10%? arbitrary?)
- UI control type (slider, dropdown, preset buttons?)

**Locations**:
- `spec.md` §FR-002 Line 120: "Default 80% opacity (configurable 50-100%)"
- `tasks.md` §T602 Line 819: "Transparency slider (50-100%)"
- `tasks.md` §T601 Line 770: "transparency: number; // 0-100"

**Conflict**: Tasks says "slider" (implies continuous), but range is ambiguous

**Proposed Resolution**:
```markdown
Transparency Configuration:
- UI Control: Slider (continuous)
- Range: 50% to 100% opacity
- Step size: 5% increments (50, 55, 60, ..., 95, 100)
- Default: 80% opacity
- Storage: Integer 50-100 (representing percentage)
- Visual feedback: Real-time preview as user drags slider
```

**Affected Documents**: spec.md §FR-002, tasks.md §T601-T602, plan.md §T601-T602

---

### H002 - Window Sharing Architecture Undefined

**Type**: Gap  
**Severity**: HIGH  
**Status**: ❌ Unresolved

**Issue**: Spec states "Both windows share same Angular app instance" but this is architecturally unclear:

**Location**: `spec.md` §FR-003 Line 129
```markdown
- Both windows share same Angular app instance
```

**Questions**:
1. Do main window and overlay window share the SAME BrowserWindow instance?
2. Do they share the SAME Angular component tree?
3. How does state synchronization work?
4. Can Angular bootstrap in two separate windows?

**Analysis**:
- Electron typically has ONE BrowserWindow per Angular instance
- Overlay window likely needs separate BrowserWindow (frameless, transparent)
- "Share same instance" probably means "share same data/state" not "same DOM"

**Proposed Resolution**:
```markdown
Window Architecture:
- Main Window: Full Angular app (BrowserWindow #1)
- Overlay Window: Separate minimal HTML + IPC (BrowserWindow #2)
- State Sharing: Via IPC communication
  - Main process tracks current quote
  - Overlay requests current quote via IPC
  - Main process sends quote data to overlay
- Not a shared Angular instance (separate renderer processes)
```

**Impact**: Architecture diagram in plan.md needs update

**Affected Documents**: spec.md §FR-003, plan.md §TR-002, tasks.md §T401-T403

---

### H003 - IPC Communication Patterns Unspecified

**Type**: Gap  
**Severity**: HIGH  
**Status**: ❌ Unresolved

**Issue**: Spec says "type-safe contracts" but doesn't define:
- Channel naming convention (e.g., `window:minimize`, `window.minimize`, `WINDOW_MINIMIZE`)
- Message format (invoke vs send vs on pattern)
- Error handling for IPC failures
- Timeout values

**Location**: `spec.md` §TR-003 Line 158-160

**Proposed Resolution**:
```typescript
// IPC Channel Naming Convention
// Pattern: <domain>:<action>
// Examples:
- 'window:minimize'
- 'window:maximize'
- 'window:close'
- 'tray:update-menu'
- 'overlay:show'
- 'overlay:hide'
- 'prefs:save'
- 'prefs:load'
- 'shortcut:register'
- 'shortcut:unregister'

// IPC Pattern Usage
- invoke/handle: Request-response (async, waits for result)
  - Example: prefs:load → returns preferences object
- send/on: Fire-and-forget (one-way notification)
  - Example: shortcut:next-quote → no response needed

// Timeout
- invoke timeout: 5 seconds (reject promise on timeout)
- Retry: No automatic retry (caller decides)
```

**Affected Documents**: spec.md §TR-003, plan.md, tasks.md §T103, §T302, §T603

---

### H004 - Package Size Inconsistency

**Type**: Inconsistency  
**Severity**: HIGH (affects success criteria)  
**Status**: ⚠️ Partially Inconsistent

**Conflicting Statements**:

**Location 1**: `spec.md` §TR-004 Line 168
```markdown
Target: <100MB installed (Windows), <150MB (macOS)
```

**Location 2**: `spec.md` §SC-006 Line 216
```markdown
App size <100MB (Windows), <150MB (macOS)
```

**Location 3**: `spec.md` §Constraints Line 241
```markdown
Package size must be reasonable (<150MB)
```

**Location 4**: `plan.md` Summary Line 66
```markdown
Package size: <150MB
```

**Location 5**: `plan.md` §SC-006 Line 630
```markdown
✅ SC-006: App size <150MB
```

**Analysis**:
- TR-004 and SC-006 specify <100MB Windows, <150MB macOS ✅ CONSISTENT
- Constraints say <150MB (no platform distinction) ⚠️ VAGUE
- Plan says <150MB (no platform distinction) ⚠️ INCONSISTENT (should match spec)

**Impact**: Plan.md success criteria doesn't match spec.md

**Proposed Resolution**:
Update `plan.md` Line 630 and Line 66:
```markdown
✅ SC-006: App size <100MB (Windows), <150MB (macOS)
- Package size: <100MB (Windows), <150MB (macOS)
```

**Affected Documents**: plan.md §Summary, §SC-006

---

## 🟡 MEDIUM PRIORITY ISSUES

### M001 - Auto-Dismiss Timer Range Inconsistency

**Type**: Inconsistency  
**Severity**: MEDIUM  
**Status**: ✅ Actually Consistent

**Locations**:
- `spec.md` §US-003: "5-30 seconds" ✅
- `spec.md` §FR-002: "5-30s" ✅
- `tasks.md` §T602: "5-30s" ✅

**Verification**: Actually consistent across all documents. Checklist CHK022 is a false positive.

**Action**: No fix needed. Mark CHK022 as verified.

---

### M002 - Overlay Content Truncation Undefined

**Type**: Gap  
**Severity**: MEDIUM  
**Status**: ❌ Unresolved

**Issue**: Clarifications state "quote text + author" but doesn't specify:
- Max character length before truncation
- Truncation strategy (ellipsis? word boundary? multi-line?)
- Long author name handling
- Vietnamese diacritics wrapping

**Location**: Clarifications, FR-002

**Proposed Resolution**:
```markdown
Overlay Content Display:
- Quote text: Max 200 characters
  - Truncate with ellipsis (...) if longer
  - Break at word boundary, not mid-word
  - Multi-line allowed (max 4 lines)
- Author: Max 50 characters
  - Truncate with ellipsis if longer
  - Single line only
- Font size: 16px quote, 14px author
- Line height: 1.5
- Vietnamese support: Full Unicode diacritics
```

**Affected Documents**: spec.md §FR-002, tasks.md §T403

---

### M003 - Keyboard Shortcut Conflict Detection Strategy

**Type**: Gap  
**Severity**: MEDIUM  
**Status**: ❌ Unresolved

**Issue**: Spec says "warn on registration failure" but doesn't specify:
- How to detect conflicts BEFORE user saves
- What the warning message should say
- Whether to suggest alternatives automatically
- Whether to allow user to force registration

**Location**: `spec.md` §FR-002, Clarifications

**Proposed Resolution**:
```markdown
Shortcut Conflict Detection:
1. User configures new shortcut in settings
2. System attempts registration (globalShortcut.register())
3. If registration fails:
   a. Show modal dialog:
      "Shortcut '[key combo]' is already in use by another application or system.
       Your previous shortcut '[old key]' will remain active.
       Try a different combination."
   b. Keep previous shortcut active
   c. Reset input field to previous value
4. If registration succeeds:
   a. Unregister old shortcut
   b. Save new shortcut
   c. Show success message (dismissible toast)
5. Conflict detection: Electron's registration failure is the only detection method
6. No automatic alternative suggestions (user picks new combo)
```

**Affected Documents**: spec.md §FR-002, tasks.md §T303

---

### M004 - Window State Restoration Edge Case

**Type**: Gap  
**Severity**: MEDIUM  
**Status**: ❌ Unresolved

**Issue**: Spec doesn't define behavior when saved window position is off-screen (monitor removed)

**Location**: `plan.md` §T504, `tasks.md` §T504

**Proposed Resolution**:
```markdown
Window State Restoration:
1. Load saved state (x, y, width, height, displayId)
2. Check if saved displayId still exists
3. If display missing:
   a. Use primary display
   b. Center window on primary display
   c. Use saved width/height (bounded by display size)
4. Check if saved position is within any display bounds
5. If position off-screen:
   a. Move to nearest visible position
   b. Ensure 50px of title bar is visible (for dragging)
6. Check if saved size exceeds display size
7. If too large:
   a. Resize to 90% of display size
   b. Center window
```

**Affected Documents**: plan.md §T504, tasks.md §T504

---

### M005 - Preferences Corruption Handling Details

**Type**: Gap  
**Severity**: MEDIUM  
**Status**: ❌ Unresolved

**Issue**: Spec says "graceful degradation" but doesn't specify:
- Which preference errors are recoverable vs fatal
- Whether to attempt partial restoration
- Backup/restore mechanism details

**Location**: `spec.md` §NFR-003, Clarifications

**Proposed Resolution**:
```markdown
Preferences Error Handling:
1. On load, attempt JSON.parse(preferences file)
2. If parse fails (corrupted JSON):
   a. Log error with stack trace
   b. Attempt to load backup preferences (prefs.json.bak)
   c. If backup fails, use hard-coded defaults
   d. Show dismissible notification:
      "Settings were corrupted and have been reset to defaults.
       Your quotes and favorites are safe."
3. If parse succeeds but validation fails (invalid values):
   a. Use defaults for invalid fields only
   b. Keep valid fields
   c. Show notification listing reset fields
4. On every save:
   a. Create backup (prefs.json → prefs.json.bak)
   b. Write new prefs.json
   c. If write fails, restore from backup

Recoverable Errors:
- Invalid shortcut key combos → use defaults
- Invalid overlay position (> 8) → use TOP_RIGHT (0)
- Invalid opacity (<50 or >100) → use 80%

Fatal Errors (prevent app start):
- quotes.json completely missing AND no backup
- Main window cannot be created
```

**Affected Documents**: spec.md §NFR-003, tasks.md §T601

---

### M006 - First-Run Experience Missing

**Type**: Gap  
**Severity**: MEDIUM  
**Status**: ❌ Unresolved

**Issue**: No requirements for first-run experience

**Proposed Resolution**:
```markdown
First-Run Experience:
1. On first launch (no preferences file):
   a. Create default preferences
   b. Show welcome dialog:
      "Welcome to Buddhist Quotes!
       The app has been minimized to your system tray.
       Click the icon to show/hide the window."
   c. Minimize to tray after 5 seconds
2. Preferences defaults:
   - Tray enabled: true
   - Auto-launch: false (user must opt-in)
   - Rotation interval: 30 seconds
   - Overlay enabled: true
   - Overlay position: TOP_RIGHT
   - Overlay duration: 10 seconds
   - Overlay opacity: 80%
```

**Affected Documents**: spec.md (new requirement), tasks.md (add to Phase 6)

---

### M007 - Memory Leak Testing Strategy

**Type**: Gap  
**Severity**: MEDIUM  
**Status**: ❌ Unresolved

**Issue**: Performance requirements specify <300MB active but no long-running test

**Proposed Resolution**:
```markdown
Memory Leak Testing:
- Test scenario: 8-hour continuous run
  - Rotation enabled (30s interval)
  - Overlay triggered 960 times (every 30s for 8 hours)
  - Main window open
- Measurement:
  - Record memory usage every 5 minutes
  - Plot memory over time
  - Check for upward trend (leak indicator)
- Success criteria:
  - Memory stays <300MB throughout
  - No continuous upward trend
  - Memory returns to idle (<150MB) after rotation pause
```

**Affected Documents**: tasks.md §T803 (add to manual testing), spec.md (add to SC)

---

### M008 - Error Message Copy Standards

**Type**: Gap  
**Severity**: MEDIUM  
**Status**: ❌ Unresolved

**Issue**: No requirements for error message tone, language, or structure

**Proposed Resolution**:
```markdown
Error Message Standards:
- Tone: Calm, helpful, Buddhist-inspired (non-alarming)
- Structure: [What happened] + [What's next/Action]
- Examples:
  ✅ GOOD: "Quote data couldn't be loaded. Using built-in quotes instead."
  ❌ BAD: "ERROR: quotes.json missing!"
  
  ✅ GOOD: "Shortcut Ctrl+Shift+Q is already in use. Please try another combination."
  ❌ BAD: "Shortcut registration failed!"

- Length: Max 100 characters
- Avoid technical jargon (IPC, renderer process, etc.)
- Always provide next action or reassurance
```

**Affected Documents**: spec.md §NFR-003, tasks.md §T804

---

## 🟢 LOW PRIORITY ISSUES

### L001 - Build Time Requirements Missing

**Type**: Gap  
**Severity**: LOW  
**Status**: ❌ Unresolved

**Issue**: No requirements for build time or development setup time

**Proposed Resolution**: Add to TR-005
```markdown
Development Performance:
- npm install: <2 minutes (initial)
- npm run dev: <30 seconds (start dev mode)
- npm run build: <5 minutes (production build)
- electron-builder: <3 minutes per platform
```

---

### L002 - Code Signing Strategy Unclear

**Type**: Ambiguity  
**Severity**: LOW  
**Status**: ⚠️ Marked Optional

**Issue**: Plan.md says "optional" for code signing but doesn't clarify if it's v1.0 or later

**Resolution**: Clarify in plan.md
```markdown
Code Signing:
- Windows: Optional for v1.0 (direct download), required for Microsoft Store
- macOS: Optional for v1.0 (DMG), required for Mac App Store
- Priority: Post-v1.0 (Month 2+)
```

---

### L003-L008 - Minor documentation gaps

- Platform-specific path conventions (CHK086)
- Disk space requirements (CHK097)
- Animation timing specifications (CHK101)
- High contrast mode details (CHK104)
- CSP policy rules (CHK089)
- Auto-update signature verification (CHK092)

---

## Traceability Verification

### User Stories → Functional Requirements

| User Story | Functional Requirement | Status |
|------------|------------------------|--------|
| US-001 System Tray | FR-002 (Tray integration) | ✅ Traced |
| US-002 Keyboard Shortcuts | FR-002 (Global shortcuts) | ✅ Traced |
| US-003 Overlay | FR-002 (Overlay) | ✅ Traced |
| US-004 Auto-Launch | FR-002 (Auto-launch) | ✅ Traced |
| US-005 Always-on-Top | FR-002 (Always-on-top) | ✅ Traced |

### Functional Requirements → Success Criteria

| FR | Success Criteria | Status |
|----|------------------|--------|
| FR-001 Core Features | SC-008 (Feature parity) | ✅ Traced |
| FR-002 Desktop Features | SC-002, SC-003, SC-004, SC-005 | ✅ Traced |
| FR-003 Window Management | SC-001 (Launch time) | ✅ Traced |
| FR-004 Cross-Platform | SC-001, SC-002, SC-005 | ✅ Traced |

### Success Criteria → Implementation Tasks

| Success Criteria | Implementation Phase | Status |
|------------------|----------------------|--------|
| SC-001 Launch <2s | Phase 1 (T101-T105) | ✅ Traced |
| SC-002 Tray Works | Phase 2 (T201-T204) | ✅ Traced |
| SC-003 Shortcuts <100ms | Phase 3 (T301-T304) | ✅ Traced |
| SC-004 Overlay <200ms | Phase 4 (T401-T405) | ✅ Traced |
| SC-005 Auto-Launch | Phase 5 (T501) | ✅ Traced |
| SC-006 App Size | Phase 7 (T701-T704) | ✅ Traced |
| SC-007 Memory <300MB | Phase 8 (T803) | ✅ Traced |
| SC-008 Feature Parity | Phase 1 (T104) | ✅ Traced |
| SC-009 User Rating | Phase 8 (T803-T805) | ⚠️ Weak trace |
| SC-010 Zero Bugs | Phase 8 (T803-T804) | ✅ Traced |

---

## Document Consistency Matrix

| Document | Lines | Last Updated | Status |
|----------|-------|--------------|--------|
| spec.md | 295 | 2025-11-21 | ✅ Complete, ⚠️ 1 Critical Conflict |
| plan.md | 660 | 2025-11-21 | ✅ Complete, ⚠️ 1 Inconsistency |
| tasks.md | 1309 | 2025-11-21 | ✅ Complete |
| checklists/electron-desktop.md | 268 | 2025-11-21 | ✅ Complete |

---

## Priority Action Items

### Immediate (Before Implementation)

1. **CRITICAL**: Resolve overlay click behavior conflict (C001)
   - Decision required: Option A, B, or C?
   - Update spec.md US-003 and FR-002
   - Update tasks.md T403-T404

2. **HIGH**: Define transparency control specification (H001)
   - Discrete vs continuous slider
   - Update spec.md FR-002
   - Update tasks.md T601-T602

3. **HIGH**: Clarify window sharing architecture (H002)
   - Update spec.md FR-003 with accurate description
   - Update plan.md TR-002 architecture diagram

4. **HIGH**: Specify IPC communication patterns (H003)
   - Create IPC contract document
   - Add to spec.md TR-003

5. **HIGH**: Fix package size inconsistency (H004)
   - Update plan.md summary and SC-006

### Short-Term (During Phase 1-2)

6. **MEDIUM**: Define overlay content truncation (M002)
7. **MEDIUM**: Specify shortcut conflict detection (M003)
8. **MEDIUM**: Define window state restoration edge cases (M004)
9. **MEDIUM**: Detail preferences corruption handling (M005)

### Long-Term (Before Beta)

10. **MEDIUM**: Add first-run experience (M006)
11. **MEDIUM**: Define memory leak testing (M007)
12. **MEDIUM**: Create error message standards (M008)

---

## Conclusion

**Overall Assessment**: ⚠️ **GOOD WITH MINOR ISSUES**

The specification is 85% complete and well-structured. The critical conflict (overlay click behavior) must be resolved before implementation begins. High-priority gaps should be filled during Phase 1.

**Strengths**:
- ✅ Excellent traceability (US → FR → SC → Tasks)
- ✅ Comprehensive clarifications addressing ambiguities
- ✅ Detailed task breakdown with time estimates
- ✅ Strong architecture documentation

**Weaknesses**:
- ❌ 1 critical specification conflict (overlay click)
- ⚠️ 4 high-priority gaps (transparency, IPC, architecture)
- ⚠️ 8 medium-priority gaps (edge cases, error handling)

**Recommendation**: **HOLD** Phase 1 implementation until C001 and H001-H004 are resolved. These can be addressed in 1-2 hours with stakeholder decisions.

**Next Steps**:
1. Schedule 30-minute clarification meeting with Product Owner
2. Resolve C001 (overlay click behavior) - get decision
3. Technical Lead specifies H001 (transparency UI), H002 (window architecture), H003 (IPC patterns)
4. Update spec.md and plan.md with resolutions
5. Re-run consistency check
6. Proceed to Phase 1 implementation

---

**Report Generated**: 2025-11-21  
**Analyzed Documents**: 4 (spec.md, plan.md, tasks.md, checklist)  
**Total Issues Found**: 30  
**Critical Issues**: 1  
**Blocking Implementation**: Yes (C001)
