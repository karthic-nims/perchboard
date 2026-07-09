# Requirements — Perchboard (Productivity Overlay Timer)

A minimal, always-on-top desktop overlay timer that doubles as a per-day task
manager. The user lists the day's productive tasks with a time budget for each,
then works through them one at a time while a large countdown floats above all
other windows. This document is the living source of truth — add new
requirements here as they come up.

**Scope:** v1 (MVP) is a **single-system, local-only** desktop app. A future
version adds accounts and cross-device sync (see Future / Backlog).

**Status:** the v1 MVP is **implemented and shipping** — latest release
**v0.1.2** (2026-07-08), with packaged installers for macOS / Windows / Linux and
in-app auto-update. Every FR/NFR below is **✅ Done** unless its row says
otherwise. Several items originally in Future/Backlog (custom colors, auto-update)
have shipped and are now tracked as functional requirements (FR-031, FR-035).

## Links & Resources

**Repository** (GitHub — owner `karthic-nims`, repo `perchboard`)
- Project home: https://github.com/karthic-nims/perchboard
- Clone (HTTPS): `https://github.com/karthic-nims/perchboard.git`
- Clone (SSH): `git@github.com:karthic-nims/perchboard.git`
- Issues: https://github.com/karthic-nims/perchboard/issues
- Commits: https://github.com/karthic-nims/perchboard/commits/master
- Release CI workflow: https://github.com/karthic-nims/perchboard/blob/master/.github/workflows/release.yml
  ([`.github/workflows/release.yml`](./.github/workflows/release.yml))

**In-repo docs**
- README (install / build / release): [`./README.md`](./README.md)
- Requirements (this doc): [`./REQUIREMENTS.md`](./REQUIREMENTS.md)
- License — MIT: [`./LICENSE`](./LICENSE)

**Releases**
- All releases: https://github.com/karthic-nims/perchboard/releases
- Latest release (auto-redirect): https://github.com/karthic-nims/perchboard/releases/latest
- Current — v0.1.2 (2026-07-08): https://github.com/karthic-nims/perchboard/releases/tag/v0.1.2

**Installers — current release (v0.1.2)** — ⚠️ these URLs embed the version and
**change every release**; for a landing page prefer the always-latest form below.
- macOS (Apple Silicon): https://github.com/karthic-nims/perchboard/releases/download/v0.1.2/Perchboard-0.1.2-arm64.dmg
- macOS (Intel): https://github.com/karthic-nims/perchboard/releases/download/v0.1.2/Perchboard-0.1.2-x64.dmg
- Windows (x64): https://github.com/karthic-nims/perchboard/releases/download/v0.1.2/Perchboard-Setup-0.1.2.exe
- Linux (x86-64): https://github.com/karthic-nims/perchboard/releases/download/v0.1.2/Perchboard-0.1.2.AppImage

**Always-latest download links** — `…/releases/latest/download/<file>` redirects to
the newest release. Artifact names are now **version-less** (configured in
`electron-builder.yml`), so these links are **permanent** from the next release
(v0.1.3) onward; the current v0.1.2 assets still carry versioned names, so the
links below resolve only once v0.1.3 is published.
- macOS (Apple Silicon): https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-arm64.dmg
- macOS (Intel): https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-x64.dmg
- Windows (x64): https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-Setup.exe
- Linux (x86-64): https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard.AppImage

**Auto-update feed** (electron-updater, FR-035) — published with every release,
not meant for manual download:
- `latest-mac.yml` · `latest.yml` · `latest-linux.yml` (+ `*.blockmap`), served from
  `…/releases/latest/download/`

> The GitHub repo has **no website / homepage URL** configured. If you publish a
> landing page, set it as the repo's homepage (GitHub → repo → About → ⚙) and add
> the link here.

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
- **Themes (FR-014):** ship **11** predefined themes across four families (**Dark / Light / Nature / Vibrant**), each with a dedicated big-countdown color, **plus a user-defined custom theme** (FR-031). Default: **Aurora**.
- **Auto-update (FR-035):** packaged builds self-update from GitHub Releases via `electron-updater`.

## Functional Requirements
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | Frameless / borderless window with a minimal card UI and **no native OS title bar / header / window chrome** on any platform (macOS traffic lights, Windows/Linux title bar all suppressed). | High | ✅ Done |
| FR-002 | Window stays above **all** other windows at the highest practical level (incl. over fullscreen apps / all spaces on macOS). | High | ✅ Done |
| FR-003 | Large, highly legible timer font as the focal element. Display `MM:SS`, switching to `H:MM:SS` only for tasks ≥ 60 min. | High | ✅ Done |
| FR-004 | Collapsed state is **fully transparent — only the timer value is visible** (no visible frame). On hover, controls/options are **revealed and the window becomes semi-opaque**; on mouse-leave it collapses back to transparent. | High | ✅ Done |
| FR-005 | Add a task with a **name** and an **allotted duration in whole minutes** (stored internally as seconds). **Validation:** non-empty name; duration an integer ≥ 1 min (cap ~600). | High | ✅ Done |
| FR-006 | Maintain an ordered **queue** of the day's tasks (pending → active → completed). | High | ✅ Done |
| FR-007 | "Start next" begins the countdown for the next pending task. After a task is marked done, the queue advances but the next timer **does not auto-start** — it waits for the user to start it (optionally overridden by **FR-030** auto-start-next). | High | ✅ Done |
| FR-008 | Countdown ticks to zero; on zero, play **ding** (once) *and* show a **desktop notification** naming the task. The display **holds at 00:00 and visually blinks/pulses** to draw attention until the user acts. Marking **done** is the default outcome; the user may override via FR-008a/FR-008b. | High | ✅ Done |
| FR-008a | If the task is not finished, the user can **assign it a new duration and start it again** (a fresh timer for the same task) instead of marking it done. | High | ✅ Done |
| FR-008b | Or **requeue the task** to the **end of the list** to redo later, instead of marking it done. | High | ✅ Done |
| FR-009 | Pause / resume / skip / reset / **complete-early** controls for the active task. The **"stop" hotkey/control = pause/resume** (keeps remaining time); reset (back to full duration) is a separate explicit action. **Complete-early** marks the current task done before the timer ends. **Skip** moves the task to the **end of the queue** to do later. | Medium | ✅ Done |
| FR-010 | Reorder, **edit (name & duration)**, and delete tasks in the queue. | Medium | ✅ Done |
| FR-011 | User can **drag the timer frame to any position on the desktop**; the chosen position is remembered across restarts. | Medium | ✅ Done |
| FR-012 | Tasks persist across restarts within the same day; **reset on a new day**. Reset is checked **on launch** (day marker ≠ today → fresh list); a continuously-running app keeps the day's list until next restart. | Medium | ✅ Done |
| FR-013 | Settings, config, and add-task views are rendered **inside the same timer window** (not separate OS windows), appearing in the semi-opaque expanded state. The task list **scrolls** when it exceeds the panel height. | High | ✅ Done |
| FR-013a | The expanded panel **shows completed tasks** (struck-through / dimmed) and a **"X of Y done" progress indicator** for the day. | Medium | ✅ Done |
| FR-014 | User can select the look from **11 built-in themes** organized in four families (**Dark / Light / Nature / Vibrant**), each with its own dedicated big-countdown color, **plus a user-defined custom theme** (FR-031). Default theme: **Aurora**. | Medium | ✅ Done |
| FR-015 | User can choose the timer **font from fonts available on the system** (app enumerates installed system fonts). | Medium | ✅ Done |
| FR-016 | User can adjust the timer **size** (font/window scale). | Medium | ✅ Done |
| FR-017 | Appearance settings (theme, font, size) **persist** across restarts. | Medium | ✅ Done |
| FR-018 | A **system tray / menu-bar icon** is the primary access + quit path (since the window has no chrome): Show/Hide, Settings, **Quit**. Closing/dismissing **hides to tray**; the app quits only via the tray menu. | High | ✅ Done |
| FR-019 | **Idle / empty state:** when no task is active (none started yet, or all done), the timer shows a neutral idle display (e.g. `00:00` / next task name) and is ready for "Start next". | Medium | ✅ Done |
| FR-020 | **Multi-monitor:** the frame can be dragged across displays; on launch, if the saved position is off-screen (display removed/changed), the window is clamped back onto a visible display. | Medium | ✅ Done |
| FR-021 | **Customizable global hotkeys** for **show/hide**, **start**, and **stop** the timer; defaults provided, and the user can rebind them. Bindings persist. | High | ✅ Done |
| FR-021a | Hotkey **conflict resistance:** cross-platform `CommandOrControl` mapping; conflict-resistant multi-modifier defaults (avoid plain `Ctrl+Alt+<letter>`/AltGr and macOS-reserved combos). **Detect registration failure** (`globalShortcut.register`/`isRegistered`) and warn + prompt to rebind instead of failing silently. | High | ✅ Done |
| FR-021b | Rebind **validation:** require ≥1 modifier, reject reserved combos, offer **reset to defaults**; unregister all shortcuts on quit. | Medium | ✅ Done |
| FR-022 | **Click-through overlay:** when collapsed/transparent, clicks on the empty (invisible) region pass through to the app behind; only the timer value and controls are interactive. | High | ✅ Done |
| FR-023 | Optional **"Launch at login/startup"** toggle (off by default), via the OS login-item mechanism. | Medium | ✅ Done |
| FR-024 | **Collapsed-state gestures** on the timer element: **hover** = expand controls; **press-and-drag** = reposition window (FR-011); clean **single-click** = pause/resume (FR-009). | High | ✅ Done |
| FR-025 | **Elapsed-while-away:** if a running timer's `endAt` passes while the app is closed or the machine is asleep, on next launch/wake **run the completion flow** (mark done by default, show blink/notification state) rather than silently dropping it. | Medium | ✅ Done |
| FR-026 | **Sound control:** a **mute toggle** and **volume** control for the ding (persisted in `settings`). | Medium | ✅ Done |
| FR-027 | **First-run discoverability:** on the very first launch, briefly reveal the expanded panel / an "add a task" hint, then settle into normal hover-hidden behavior. | Medium | ✅ Done |
| FR-028 | **Rest breaks:** finishing a task prompts an optional rest break — **take** it (its own countdown, default length from `settings.breakMinutes`) or **skip** it. A break is timed like a task but carries no task record (`activeTimer.isBreak`). | Medium | ✅ Done |
| FR-029 | **"About to end" warning:** in the final `settings.warningSec` seconds the timer **pulses amber**, and an optional **soft chime** (`settings.warningSound`) plays when the warning window begins. Lead time is user-configurable; `0` disables it. | Medium | ✅ Done |
| FR-030 | **Auto-start next (opt-in):** `settings.autoStartNext` relaxes FR-007 — after a task completes (or a rest break ends) the next pending task starts automatically. Off by default. | Low | ✅ Done |
| FR-031 | **Custom theme:** beyond the 11 presets the user can define a **custom theme** from three colors (**background / text / accent**); the rest of the palette is derived. Persisted in `appearance.custom`. Supersedes the former Future/Backlog "free color" item. | Medium | ✅ Done |
| FR-032 | **Taskbar / Dock mode (opt-in):** `settings.showInTaskbar` switches the overlay from tray-only to a normal windowed app that appears in the taskbar/Dock and can be **minimized** (— button); turning it off restores the tray-only floating overlay. When minimized, the always-on-top float is dropped and restored on return. | Low | ✅ Done |
| FR-033 | **In-app help / guide:** an expandable **Help** panel documents the overlay gestures, task controls, end-of-timer actions, breaks, the ending warning, window/tray behavior, and the current (live) hotkey bindings. | Low | ✅ Done |
| FR-034 | **Clear completed:** a one-tap action removes all completed tasks from today's list without waiting for the daily reset. | Low | ✅ Done |
| FR-035 | **Auto-update:** packaged builds check GitHub Releases on launch and update in the background via `electron-updater` (no-op in dev / unpackaged). Promoted from Future/Backlog. | Medium | ✅ Done |

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
| `activeTimer` | Resume mid-task after restart — `{ taskId, endAt, paused, remainingSec, isBreak? }`. `remainingSec` is authoritative while paused; `isBreak` marks a rest break with no task record (FR-028). On launch, if `endAt` already passed (app was closed/asleep), trigger the completion flow (FR-025). |
| `appearance` | User customizations — `{ theme, fontFamily, size, custom: { bg, fg, accent } }` (FR-014/015/016/017/031). |
| `hotkeys` | Custom bindings for show/hide, start, stop (FR-021). |
| `windowPosition` | Last dragged location on the desktop `{ x, y }` (FR-011). |
| `settings` | `{ launchAtLogin, clickThrough, volume, muted, notifications, autoStartNext, breakMinutes, warningSec, warningSound, showInTaskbar }` (FR-022/023/026/028/029/030/032). |

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
- ~~**Free color customization**~~ — **✅ Delivered** as the custom theme (FR-031):
  the user picks background / text / accent and the rest of the palette is derived.
- **Distribution hardening (still pending):** installers (dmg / NSIS / AppImage),
  auto-update, and **version-less artifact names** (permanent download links) ship
  today, but the builds are **not yet code-signed or notarized** — macOS Gatekeeper
  and Windows SmartScreen still warn on first launch (see the README install steps).
  Add Apple signing + notarization and a Windows Authenticode certificate for
  friction-free installs.
- ~~**Auto-update**~~ — **✅ Delivered** (FR-035): packaged builds self-update from
  GitHub Releases via `electron-updater`.
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
- 2026-07-09 — **Implementation reconciliation** against shipped v0.1.2. Flipped all FR/NFR statuses to **✅ Done**; added a **Status** line to the header. Documented features that grew beyond the original spec as new requirements: FR-028 (rest breaks), FR-029 ("about to end" amber warning + chime), FR-030 (opt-in auto-start-next, relaxing FR-007), FR-031 (custom theme — supersedes the backlog "free color" item), FR-032 (taskbar/Dock mode with minimize), FR-033 (in-app Help panel), FR-034 (clear-completed), FR-035 (auto-update — promoted from backlog). FR-014 updated to **11 themes across Dark/Light/Nature/Vibrant** (default Aurora) plus the custom theme. Storage model updated: `appearance.custom`, `activeTimer.remainingSec`/`isBreak`, and `settings.{autoStartNext, breakMinutes, warningSec, warningSound, showInTaskbar}`. Future/Backlog: marked free-color and auto-update **Delivered**; code-signing / notarization remains the only pending distribution item.
