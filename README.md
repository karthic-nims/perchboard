# Perchboard

A minimal, always-on-top **overlay timer** and per-day task manager for macOS,
Windows, and Linux. Add the day's tasks with a time budget each, then work
through them one at a time while a large countdown floats above all your windows.

> *A floating focus timer for your daily tasks.*

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the full spec.

---

## Features

- **Always-on-top overlay** — a large countdown that floats above every window,
  even fullscreen apps. Transparent and **click-through** when collapsed; hover to
  reveal the panel.
- **Per-day task queue** — add tasks with a per-task time budget; work them one at
  a time. The list **auto-resets each new day**.
- **Drift-free countdown** — end-timestamp based. At zero it **dings**, fires a
  **desktop notification**, and blinks at `00:00` until you choose **Done**,
  **Requeue** (do later), or **Restart** with more time.
- **Timer controls** — pause/resume, reset, skip-to-end, complete-early.
- **Rest breaks** — optionally prompt a short break after finishing a task.
- **"About to end" warning** — an optional soft chime a configurable number of
  seconds before time runs out.
- **11 built-in themes** (light → dark, across Dark/Light/Nature/Vibrant) **plus
  custom colors**, a **system-font picker**, and an adjustable timer size.
- **Rebindable global hotkeys** for show/hide, start, and stop, with
  conflict-resistant defaults and registration-failure detection.
- **Drag anywhere & multi-monitor aware** — remembers position; clamps back
  on-screen if a display is removed. Runs from the **menu-bar / system tray**;
  optional **launch at login**.
- **Local-only & offline** — no accounts, no telemetry, no network calls; all
  state lives in one local config file.
- **Cross-platform** — macOS (Apple Silicon + Intel), Windows, and Linux, with
  built-in **auto-update**.

---

## Download

Download the installer for your OS + CPU directly below — each link always
resolves to the **newest release** — or browse every version on the
[**Releases**](https://github.com/karthic-nims/perchboard/releases) page.

| OS | CPU / Arch | Download | Type |
|----|------------|----------|------|
| **macOS** | Apple Silicon (M1/M2/M3…) | [`Perchboard-arm64.dmg`](https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-arm64.dmg) | Disk image |
| **macOS** | Intel | [`Perchboard-x64.dmg`](https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-x64.dmg) | Disk image |
| **Windows** | x64 | [`Perchboard-Setup.exe`](https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-Setup.exe) | NSIS installer |
| **Linux** | x86-64 | [`Perchboard.AppImage`](https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard.AppImage) | Portable app |

> **If a download 404s:** the version-less filenames above take effect from the
> **next** release. Until then, grab the installer from the
> [latest release](https://github.com/karthic-nims/perchboard/releases/latest) page.

The `*.blockmap` and `latest*.yml` files alongside them are **auto-update
metadata**, not downloads — you don't need them. On launch, an installed build
checks GitHub Releases and updates itself, automatically picking the matching
macOS architecture.

### Linking from a website or landing page

The four download URLs above are **permanent and never change**. Each points at
`…/releases/latest/download/<file>`, which GitHub always redirects to the newest
published release, and the installer filenames carry **no version number** — so a
landing page can hardcode these links **once** and every future release is served
automatically, with no edits. These are the canonical links to use externally:

```
https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-arm64.dmg     # macOS Apple Silicon
https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-x64.dmg        # macOS Intel
https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-Setup.exe      # Windows x64
https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard.AppImage       # Linux x86-64
```

Drop-in HTML for the launch page:

```html
<a href="https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-arm64.dmg">Download for macOS (Apple Silicon)</a>
<a href="https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-x64.dmg">Download for macOS (Intel)</a>
<a href="https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard-Setup.exe">Download for Windows</a>
<a href="https://github.com/karthic-nims/perchboard/releases/latest/download/Perchboard.AppImage">Download for Linux</a>
<a href="https://github.com/karthic-nims/perchboard/releases/latest">All downloads &amp; release notes</a>
```

- **Show all four buttons.** A browser can't distinguish Apple Silicon from Intel
  (both report as "Macintosh"), so never auto-pick one Mac build — let the user choose.
- **Links go live once the first version-less release (v0.1.3) is published.** Until
  then they 404, because the current v0.1.2 assets still carry versioned names.
- No API calls, no rate limits, no JavaScript required — these are plain static
  redirects, so they work from any static site or CDN.

**System requirements** — **macOS** 10.15 Catalina or later · **Windows** 10 or
later (**64-bit only**) · **Linux** **x86-64** with glibc and FUSE 2. There are
**no 32-bit builds and no ARM-Linux build** — if your OS is older than these or
on a different CPU, the installer will download but the app won't launch.

> **⚠️ Not code-signed or notarized yet.** Because there are no signing
> certificates on the builds, your OS *will* flag Perchboard on first launch —
> **this is expected, not a sign anything is wrong**:
> - **macOS** — Gatekeeper says *"Perchboard can't be opened because Apple cannot
>   check it for malicious software"* or *"…is damaged and can't be opened."*
> - **Windows** — SmartScreen shows a blue *"Windows protected your PC"* dialog.
> - **Linux** — no warning; nothing to bypass.
>
> These are **one-time** prompts. Follow the per-OS steps below to get past them;
> after the first launch the app opens normally. If you'd rather verify the build
> yourself first, it's fully open source — build it [from source](#run-it-from-source-for-development).

---

## Run it (installed app)

### macOS
1. Open the `.dmg` and drag **Perchboard** into your **Applications** folder.
   - Apple Silicon Mac → use the **`-arm64`** dmg. Intel Mac → use the **`-x64`** dmg.
   - Not sure which? **Apple menu →  About This Mac**: "Apple M1/M2/M3…" = arm64,
     "Intel" = x64. (Picking the wrong one just won't launch — no harm done.)
2. Because the app is unsigned, first launch is blocked. **Which method works
   depends on your macOS version** — try them top to bottom:

   **macOS 15 (Sequoia) and newer** *(right-click → Open was removed here)*
   1. Double-click **Perchboard** once. You'll get the "cannot be opened" warning —
      click **Done** (do **not** click "Move to Trash").
   2. Open **System Settings → Privacy & Security**, scroll to the **Security**
      section. You'll see *"Perchboard was blocked to protect your Mac"* with an
      **Open Anyway** button — click it, then authenticate with Touch ID / password.
   3. A final dialog appears — click **Open Anyway** once more. Done for good.

   **macOS 13–14 (Ventura / Sonoma) and earlier**
   - **Right-click (or Control-click) the app icon → Open → Open.** You only do this once.

   **Fallback for any version (or if you see *"Perchboard is damaged and can't be
   opened"*)** — this message just means the file is quarantined + unsigned; it is
   **not** actually damaged. Strip the quarantine flag in Terminal, then open normally:
   ```bash
   xattr -dr com.apple.quarantine /Applications/Perchboard.app
   ```
3. Perchboard has **no Dock icon and no window chrome** — it lives in the
   **menu bar** (top-right). Click the menu-bar icon for **Show / Hide**,
   **Settings**, and **Quit**.

### Windows
1. Run `Perchboard-Setup.exe`.
2. SmartScreen shows a blue **"Windows protected your PC"** dialog because the
   installer is unsigned. The **Run anyway** button is hidden by default:
   1. Click the **More info** link (small text under the message).
   2. A **Run anyway** button appears at the bottom — click it. You only do this once.
   - **Alternative:** right-click the downloaded `.exe` → **Properties** → tick
     **Unblock** at the bottom of the General tab → **OK**, then run it — SmartScreen
     won't prompt at all.
   - Your browser (Edge/Chrome) may *also* warn that the download is "not commonly
     downloaded" — choose **Keep** / **Keep anyway** to save the file.
3. The installer sets up the app and a Start-menu entry. The app runs from the
   **system tray** (bottom-right) — right-click the tray icon for
   **Show / Hide**, **Settings**, and **Quit**.

### Linux
1. Make the AppImage executable, then run it:
   ```bash
   chmod +x Perchboard.AppImage
   ./Perchboard.AppImage
   ```
2. AppImage is **distro-agnostic** — it runs on any modern x86-64 distribution
   (Ubuntu, Debian, Fedora, openSUSE, Arch, Mint, Pop!_OS…). No install step.
3. If it fails to start with a FUSE error, install FUSE 2:
   `sudo apt install libfuse2` (Debian/Ubuntu) or the equivalent for your distro.
4. The app runs from the **system-tray / indicator** area.

### First things to try (any OS)
- Hover the floating timer → the panel expands; add a task (name + minutes).
- Click **Start** (or the hotkey) to begin the countdown; a clean click on the
  timer **pauses/resumes**; drag it anywhere to reposition.
- Default global hotkeys (rebindable in **Settings**):
  `⌘/Ctrl+Alt+Shift+T` show/hide · `…+S` start · `…+E` stop (pause/resume).

---

## Uninstall

Perchboard stores everything locally in a single config folder (tasks, appearance,
hotkeys, settings) — no accounts, no cloud, nothing outside these paths. Removing
the app and that folder uninstalls it completely.

### macOS
1. **Quit** Perchboard from the menu-bar icon.
2. Drag **Perchboard** from **Applications** to the Trash.
3. Remove settings + data (optional):
   ```bash
   rm -rf ~/Library/Application\ Support/Perchboard
   ```
4. If you turned on **Launch at login**, clear it in
   System Settings → General → Login Items (removing the app also stops it).

### Windows
1. **Quit** Perchboard from the tray icon.
2. Uninstall via **Settings → Apps → Installed apps → Perchboard → Uninstall**
   (or the Start-menu uninstaller) — this removes the app and its Start-menu entry.
3. Remove settings + data (optional), in PowerShell:
   ```powershell
   Remove-Item -Recurse -Force "$env:APPDATA\Perchboard"
   ```

### Linux
1. **Quit** Perchboard from the tray/indicator.
2. Delete the AppImage — it's portable, nothing else was installed:
   ```bash
   rm Perchboard.AppImage
   ```
3. Remove settings + data (optional):
   ```bash
   rm -rf ~/.config/Perchboard
   ```
4. If a desktop launcher was created for it (e.g. by AppImageLauncher), remove
   that entry too.

---

## Run it (from source, for development)

**Prerequisites:** [Node.js](https://nodejs.org) 20+ and npm.

```bash
git clone https://github.com/karthic-nims/perchboard.git
cd perchboard
npm install        # postinstall runs scripts/gen-assets.cjs to embed the ding +
                   # warning sounds + tray icon as data URLs
npm run dev        # launches the app with hot reload (electron-vite dev)
```

`npm run dev` opens the live app; edits to the renderer hot-reload, and main-process
changes restart it. This is the normal way to run Perchboard while developing.

---

## Build & package it yourself

| Command | What it does | Output |
|---------|--------------|--------|
| `npm run typecheck` | `tsc` for main + renderer (no emit) | — |
| `npm run build` | Production bundle of main / preload / renderer | `out/` |
| `npm run dist` | `build` **+** package installers via electron-builder | `dist/` |
| `npm run gen-icon` | Regenerate the app icon | `resources/icon.png` |

- **`out/`** holds the compiled app bundles that Electron loads.
- **`dist/`** holds the packaged installers for your current OS — running
  `npm run dist` on a Mac produces the `.dmg`(s), on Windows the `.exe`, on Linux
  the `.AppImage`. Cross-OS installers come from CI (below), not one machine.
- On macOS, `npm run dist` builds **both** `arm64` and `x64` dmgs (configured in
  [`electron-builder.yml`](./electron-builder.yml)).

Both `out/` and `dist/` are git-ignored.

---

## Releasing (CI)

Releases are built and published automatically by
[`.github/workflows/release.yml`](./.github/workflows/release.yml) — a matrix
build across macOS, Windows, and Linux runners that runs when you push a `v*` tag.

To cut a release:
```bash
# 1. Bump the version (updates package.json + package-lock.json):
npm version <new-version> --no-git-tag-version   # e.g. 0.1.3
git commit -am "Release v<new-version>"

# 2. Tag it (the tag MUST match the package.json version) and push:
git tag v<new-version>
git push origin master --tags
```
The workflow builds every platform's installer and uploads them to a **draft**
GitHub Release for that tag. Review it on the Releases page and click **Publish**.
`electron-updater` then delivers the update to existing users on their next launch.

---

## Roadmap

Today Perchboard is **local-only** and you add each day's tasks by hand. A planned
direction is **task-manager integrations** — pull tasks straight from the tools you
already use instead of retyping them, and (where the service allows) push
completions back. Candidates on the radar include **Todoist, Things, Notion, Jira,
Asana, Trello, GitHub Issues, and Google Tasks**.

The app is designed with this in mind: the main process owns all persistence behind
an IPC boundary (see [REQUIREMENTS.md](./REQUIREMENTS.md) → Storage), which is the
seam these connectors will plug into without touching the timer UI. This is
exploratory and **not in the current build** — expect it in a future release.

## How it works
- **Tray / menu-bar icon** is the home base: Show/Hide, Settings, Quit. The window
  has no OS chrome.
- The overlay is **transparent and click-through** when collapsed — only the timer
  value shows. **Hover** it to reveal the semi-opaque panel (tasks + controls +
  settings). **Drag** the timer to reposition; a clean **click** pauses/resumes.
- Global hotkeys (rebindable in Settings): `⌘/Ctrl+Alt+Shift+T` show/hide,
  `…+S` start, `…+E` stop (pause/resume).
- When a task's timer hits zero it **dings**, fires a **desktop notification**, and
  blinks at `00:00` until you pick **Done**, **Do later** (requeue), or **Restart**
  with more time. Finishing a task can prompt an optional **rest break**.
- Data is local-only (via [electron-store](https://github.com/sindresorhus/electron-store))
  and resets to a fresh list each new day.

## Stack
Electron + React + TypeScript, bundled with [electron-vite](https://electron-vite.org).
State in [Zustand](https://github.com/pmndrs/zustand); local persistence via
electron-store; auto-update via
[electron-updater](https://www.electron.build/auto-update); system-font
enumeration via [font-list](https://github.com/oldj/node-font-list).

### Project layout
```
src/main/      Electron main process — window, tray, hotkeys, IPC, persistence, auto-update
src/preload/   contextBridge API + shared TypeScript types
src/renderer/  React UI (store, hooks, components, themes, styles)
scripts/       gen-assets.cjs — embeds the ding + warning sounds + tray icon as data URLs
```

## License

[MIT](./LICENSE) © 2026 Karthic.C.D
