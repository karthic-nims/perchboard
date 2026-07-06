# Requirements — Productivity Overlay Timer

A minimal, always-on-top desktop overlay timer that doubles as a per-day task
manager. The user lists the day's productive tasks with a time budget for each,
then works through them one at a time while a large countdown floats above all
other windows. This document is the living source of truth — add new
requirements here as they come up.

**Scope:** v1 (MVP) is a **single-system, local-only** desktop app. A future
version adds accounts and cross-device sync (see Future / Backlog).

## Overview
- Frameless, minimal overlay app with large timer fonts.
- Floats above all other windows (maximum possible level).
- Per-day task manager: add tasks, assign a completion time to each.
- Start the next task from the queue → countdown runs → ends with a **ding** when done.
- Cross-platform desktop: macOS, Windows, Linux.

## Confirmed Decisions
- **Framework:** Electron + React (Vite, TypeScript).
- **Persistence:** Save the day's tasks locally; fresh list each new day (no cross-day history in v1 — see Future / Backlog).
- **Sound:** Bundled "ding" audio file played when a task timer reaches zero.
- **Default hotkeys (FR-021):** `CmdOrCtrl+Alt+Shift+T` = show/hide, `CmdOrCtrl+Alt+Shift+S` = start, `CmdOrCtrl+Alt+Shift+E` = stop. Triple-modifier chord chosen for cross-app conflict resistance + AltGr safety; all user-rebindable.
- **Themes (FR-014):** ship **5** predefined themes spanning **light → dark** (e.g. Light, Soft/Sepia, Slate, Dark, Black/OLED — exact palettes finalized at design time).

## Functional Requirements
| ID | Requirement | Priority | Status |
|----|-------------|----------|---
| FR-001 | Frameless / borderless window with a minimal card UI and **no native OS title bar / header / window chrome** on any platform (macOS traffic lights, Windows/Linux title bar all suppressed). | High | Planned |
| FR-002 | Window stays above **all** other windows at the highest practical level (incl. over fullscreen apps / all spaces on macOS). | High | Planned |
| FR-003 | Large, highly legible timer font as the focal element. Display `MM:SS`, switching to `H:MM:SS` only for tasks ≥ 60 min. | High | Planned |
| FR-004 | Collapsed state is **fully transparent — only the timer value is visible** (no visible frame). On hover, controls/options are **revealed and the window becomes semi-opaque**; on mouse-leave it collapses back to transparent. | High | Planned |
| FR-005 | Add a task with a **name** and an **allotted duration in whole minutes** (stored internally as seconds). **Validation:** non-empty name; duration an integer ≥ 1 min (cap ~600). | High | Planned |
| FR-006 | Maintain an ordered **queue** of the day's tasks (pending → active → completed). | High | Planned |
| FR-007 | "Start next" begins the countdown for the next pending task. After a task is marked done, the queue advances but the next timer **does not auto-start** — it waits for the user to start it. | High | Planned |
| FR-008 | Countdown ticks to zero; on zero, play **ding** (once) *and* show a **desktop notification** naming the task. The display **holds at 00:00 and visually blinks/pulses** to draw attention until the user acts. Marking **done** is the default outcome; the user may override via FR-008a/FR-008b. | High | Planned |
| FR-008a | If the task is not finished, the user can **assign it a new duration and start it again** (a fresh timer for the same task) instead of marking it done. | High | Planned |
| FR-008b | Or **requeue the task** to the **end of the list** to redo later, instead of marking it done. | High | Planned |
| FR-009 | Pause / resume / skip / reset / **complete-early** controls for the active task. The **"stop" hotkey/control = pause/resume** (keeps remaining time); reset (back to full duration) is a separate explicit action. **Complete-early** marks the current task done before the timer ends. **Skip** moves the task to the **end of the queue** to do later. | Medium | Planned |
| FR-010 | Reorder, **edit (name & duration)**, and delete tasks in the queue. | Medium | Planned |
| FR-011 | User can **drag the timer frame to any position on the desktop**; the chosen position is remembered across restarts. | Medium | Planned |
| FR-012 | Tasks persist across restarts within the same day; **reset on a new day**. Reset is checked **on launch** (day marker ≠ today → fresh list); a continuously-running app keeps the day's list until next restart. | Medium | Planned |
| FR-013 | Settings, config, and add-task views are rendered **inside the same timer window** (not separate OS windows), appearing in the semi-opaque expanded state. The task list **scrolls** when it exceeds the panel height. | High | Planned |
| FR-013a | The expanded panel **shows completed tasks** (struck-through / dimmed) and a **"X of Y done" progress indicator** for the day. | Medium | Planned |
| FR-014 | User can select the look from **5 predefined themes spanning a light → dark range** (free color customization deferred — see Future / Backlog). | Medium | Planned |
| FR-015 | User can choose the timer **font from fonts available on the system** (app enumerates installed system fonts). | Medium | Planned |
| FR-016 | User can adjust the timer **size** (font/window scale). | Medium | Planned |
| FR-017 | Appearance settings (theme, font, size) **persist** across restarts. | Medium | Planned |
| FR-018 | A **system tray / menu-bar icon** is the primary access + quit path (since the window has no chrome): Show/Hide, Settings, **Quit**. Closing/dismissing **hides to tray**; the app quits only via the tray menu. | High | Planned |
| FR-019 | **Idle / empty state:** when no task is active (none started yet, or all done), the timer shows a neutral idle display (e.g. `00:00` / next task name) and is ready for "Start next". | Medium | Planned |
| FR-020 | **Multi-monitor:** the frame can be dragged across displays; on launch, if the saved position is off-screen (display removed/changed), the window is clamped back onto a visible display. | Medium | Planned |
| FR-021 | **Customizable global hotkeys** for **show/hide**, **start**, and **stop** the timer; defaults provided, and the user can rebind them. Bindings persist. | High | Planned |
| FR-021a | Hotkey **conflict resistance:** cross-platform `CommandOrControl` mapping; conflict-resistant multi-modifier defaults (avoid plain `Ctrl+Alt+<letter>`/AltGr and macOS-reserved combos). **Detect registration failure** (`globalShortcut.register`/`isRegistered`) and warn + prompt to rebind instead of failing silently. | High | Planned |
| FR-021b | Rebind **validation:** require ≥1 modifier, reject reserved combos, offer **reset to defaults**; unregister all shortcuts on quit. | Medium | Planned |
| FR-022 | **Click-through overlay:** when collapsed/transparent, clicks on the empty (invisible) region pass through to the app behind; only the timer value and controls are interactive. | High | Planned |
| FR-023 | Optional **"Launch at login/startup"** toggle (off by default), via the OS login-item mechanism. | Medium | Planned |
| FR-024 | **Collapsed-state gestures** on the timer element: **hover** = expand controls; **press-and-drag** = reposition window (FR-011); clean **single-click** = pause/resume (FR-009). | High | Planned |
| FR-025 | **Elapsed-while-away:** if a running timer's `endAt` passes while the app is closed or the machine is asleep, on next launch/wake **run the completion flow** (mark done by default, show blink/notification state) rather than silently dropping it. | Medium | Planned |
| FR-026 | **Sound control:** a **mute toggle** and **volume** control for the ding (persisted in `settings`). | Medium | Planned |
| FR-027 | **First-run discoverability:** on the very first launch, briefly reveal the expanded panel / an "add a task" hint, then settle into normal hover-hidden behavior. | Medium | Planned |

## Non-Functional Requirements
| ID | Requirement |
|----|-------------|
| NFR-001 | Cross-platform — macOS, Windows, Linux from one codebase. |
| NFR-002 | Minimal, distraction-free visual design; transparent rounded window. |
| NFR-003 | Timer accuracy via end-timestamp math (no interval drift). |
| NFR-004 | Offline — bundled sound, local-only storage, no network calls. |
| NFR-005 | Small idle footprint. |
| NFR-006 | **Single-instance lock** — only one copy of the app runs; a second launch focuses/reveals the existing overlay instead of opening a duplicate. |
| NFR-007 | **Notification permission** requested on first run (macOS); degrade gracefully if denied — the ding still plays. |
| NFR-008 | **Accessibility:** controls in the expanded panel are keyboard-operable and labeled. |
| NFR-009 | **Branding:** ship an app icon (tray/menu-bar, dock/taskbar, installer). |
| NFR-010 | **No focus stealing:** the overlay is a non-activating window — showing it or firing a hotkey must **not take keyboard focus** from the user's active app. |

## Storage (MVP)
Local-only, offline persistence via **`electron-store`** — a single JSON file
managed in the main process and accessed from the renderer over IPC
(`tasks:load` / `tasks:save`). Footprint is a few KB/day.

**Data model persisted**
| Key | Purpose |
|-----|---------|
| `day` | Date marker (e.g. `"2026-06-25"`); if ≠ today on launch → fresh list (FR-012). |
| `tasks[]` | Today's queue — each `{ id, name, durationSec, status, order }`; `status` ∈ `pending` / `active` / `completed` / `skipped`. |
| `firstRunDone` | Flag to show the first-run discoverability hint only once (FR-027). |
| `activeTimer` | Resume mid-task after restart — `{ taskId, endAt, paused }`. On launch, if `endAt` already passed (app was closed/asleep), trigger the completion flow (FR-025). |
| `appearance` | User customizations — `{ theme, fontFamily, size }` (FR-014/015/016/017). |
| `hotkeys` | Custom bindings for show/hide, start, stop (FR-021). |
| `windowPosition` | Last dragged location on the desktop `{ x, y }` (FR-011). |
| `settings` | `{ launchAtLogin, clickThrough, volume, muted, notifications }` (FR-022/023/026). |

**File location** (`app.getPath('userData')`, app name `Perchboard`):
- **macOS:** `~/Library/Application Support/Perchboard/config.json`
- **Windows:** `%APPDATA%\Perchboard\config.json`
- **Linux:** `~/.config/Perchboard/config.json` (respects `XDG_CONFIG_HOME`)

This is the OS per-user app-data dir: isolated per user, preserved across app
updates, easy to inspect/delete. Renderer `localStorage`/`IndexedDB` rejected
(tied to the Chromium profile, harder to control); SQLite rejected as overkill
for a flat daily list.

**Migration path:** when Future/Backlog "Task history" lands, add a SQLite DB
(`better-sqlite3`) in the **same** `userData` dir for the append-only history.
The IPC boundary keeps storage swappable without touching the UI.

## Non-Goals (v1)
- No mobile/web clients — desktop only.
- No accounts, cloud sync, or multi-device (see Future / Backlog).
- No team/shared task lists or collaboration.
- No cross-day history, reporting, or analytics.
- English-only UI (no localization in v1).

## Future / Backlog
- **Task history (future version):** persist a record of completed and deleted
  tasks across days (name, duration, completion/deletion timestamp, outcome) so
  past activity can be reviewed and reported in later releases. Not in v1.
- **Free color customization (future version):** a custom color picker for the
  timer/UI. v1 ships **predefined themes only** (FR-014); free color choice is deferred.
- **Distribution hardening (pre-release):** code-signing + notarization (macOS
  Gatekeeper) and Windows signing (SmartScreen) for friction-free installs.
- **Auto-update:** in-app update mechanism (e.g. `electron-updater`) for shipping
  new versions without manual reinstall.
- **Accounts + cross-device sync (future version):** today the app is
  **single-system / local-only**. Later, introduce **user credentials
  (sign-in)** so a user's tasks and history follow them to **any device they log
  in on**. Implies: an auth provider, a cloud backend/datastore syncing the
  local state, conflict resolution across devices, and offline-first behavior
  that reconciles on reconnect. The MVP's IPC storage boundary (main process
  owns persistence) is the seam where a sync backend would plug in. Not in v1.

## Open Questions
- _(none blocking — exact theme palettes and any hotkey-default tweaks to be finalized at design time.)_

**Resolved:** auto-advance → wait for user (FR-007); duration unit → whole minutes (FR-005); behavior at zero → blink/alert at 00:00 (FR-008); app access/quit → tray icon (FR-018); unfinished-task handling → new timer & restart (FR-008a) or requeue to end (FR-008b); appearance → 5 predefined light→dark themes in v1, free color deferred (FR-014); hotkeys → customizable for show/hide/start/stop with conflict-resistant triple-modifier defaults + registration-failure handling (FR-021/021a/021b). Font enumeration (FR-015) is a build-time technical choice (`font-list`-style package), not a product decision.

## Changelog
- 2026-06-25 — Initial requirements captured from first spec (overlay timer + per-day task manager); framework/persistence/sound decisions recorded.
- 2026-06-25 — FR-008 now requires a desktop notification alongside the ding on task completion. Task history (completed/deleted records) moved to Future/Backlog for a later version; v1 keeps only same-day persistence with daily reset.
- 2026-06-25 — On ding, the current task is marked done by default (FR-008). Added FR-008a (add more time / extend + resume) and FR-008b (requeue the task as a to-do after the current list) as alternatives when the task isn't finished.
- 2026-06-25 — Added Storage (MVP) section: `electron-store` JSON in `app.getPath('userData')`, documented data model + per-OS file paths, and the JSON→SQLite migration path for future task history.
- 2026-06-25 — Clarified v1 scope as single-system/local-only; added Future/Backlog item for accounts + cross-device sync (auth, cloud datastore, conflict resolution, offline-first) plugging into the IPC storage seam.
- 2026-06-25 — Appearance & windowing detail: FR-001 explicitly suppresses all native OS title bars/chrome; FR-004 clarified (transparent collapsed = timer only → semi-opaque on hover); FR-011 = drag anywhere + remember position. Added FR-013 (settings/add-task panels rendered inside the same window), FR-014 (color), FR-015 (font from system fonts), FR-016 (size), FR-017 (persist appearance). Storage now persists `appearance` and `windowPosition`.
- 2026-06-25 — Review pass: fixed Confirmed-Decisions "short history" inconsistency (v1 has no cross-day history). Resolved open questions — FR-005 durations in whole minutes, FR-007 next task waits (no auto-start), FR-008 blink/hold at 00:00 with done as default, FR-010 now includes edit. Added FR-018 (tray/menu-bar icon for access + quit), FR-019 (idle/empty display), FR-020 (multi-monitor drag + off-screen clamp).
- 2026-06-25 — Reworked unfinished-task handling: FR-008a is now "assign a new duration and start again" (not "add more time"); FR-008b requeues to the end of the list. FR-014 changed to predefined-theme selection; free color customization moved to Future/Backlog. Added FR-021 (customizable global hotkeys for show/hide, start, stop). Storage gains `hotkeys` and `appearance.theme`.
- 2026-06-25 — Hotkey conflict strategy: added FR-021a (conflict-resistant `CommandOrControl` multi-modifier defaults, avoid AltGr/reserved combos, detect registration failure + warn) and FR-021b (rebind validation + reset-to-defaults). Set default bindings (`CmdOrCtrl+Alt+Shift+T/S/E`). FR-014 fixed at 5 predefined themes spanning light→dark.
- 2026-06-25 — MVP edge cases settled: FR-022 (click-through overlay), FR-023 (launch-at-login toggle), FR-009 "stop" = pause/resume, FR-012 reset checked on launch only, FR-018 close→hide to tray, FR-003 time format (MM:SS / H:MM:SS ≥60min). Added NFR-006 (single-instance lock) and NFR-007 (notification permission, graceful degrade). `settings` storage expanded.
- 2026-06-25 — Deeper gap pass: added FR-024 (collapsed gestures — hover/drag/click mapping), FR-025 (elapsed-while-away → run completion flow on return). FR-005 input validation; FR-009 gains complete-early + skip-to-end semantics. Added NFR-008 (accessibility) and NFR-009 (app icon/branding). Backlog: distribution code-signing/notarization and auto-update.
- 2026-06-26 — Third gap pass: added NFR-010 (no focus stealing — non-activating overlay), FR-013a (show completed + "X of Y done" progress), FR-026 (mute/volume), FR-027 (first-run discoverability hint), FR-013 scrollable list, FR-008 ding plays once. Fixed FR-017 wording (theme, not color). Storage: `status` enum incl. `skipped`, `firstRunDone`, `settings.muted`. Added a **Non-Goals (v1)** section to fence scope.
