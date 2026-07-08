# Perchboard

A minimal, always-on-top **overlay timer** and per-day task manager for macOS,
Windows, and Linux. Add the day's tasks with a time budget each, then work
through them one at a time while a large countdown floats above all your windows.

> *A floating focus timer for your daily tasks.*

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the full spec.

---

## Download

Grab the latest installer for your OS + CPU from the
[**Releases**](https://github.com/karthic-nims/perchboard/releases) page.

| OS | CPU / Arch | File | Type |
|----|------------|------|------|
| **macOS** | Apple Silicon (M1/M2/M3…) | `Perchboard-<version>-arm64.dmg` | Disk image |
| **macOS** | Intel | `Perchboard-<version>-x64.dmg` | Disk image |
| **Windows** | x64 | `Perchboard-Setup-<version>.exe` | NSIS installer |
| **Linux** | x64 | `Perchboard-<version>.AppImage` | Portable app |

The `*.blockmap` and `latest*.yml` files alongside them are **auto-update
metadata**, not downloads — you don't need them. On launch, an installed build
checks GitHub Releases and updates itself, automatically picking the matching
macOS architecture.

> **Not code-signed yet:** macOS Gatekeeper and Windows SmartScreen will warn on
> first launch until signing certificates are added — see the per-OS steps below
> for how to get past the warning.

---

## Run it (installed app)

### macOS
1. Open the `.dmg` and drag **Perchboard** into your **Applications** folder.
   - Apple Silicon Mac → use the **`-arm64`** dmg. Intel Mac → use the **`-x64`** dmg.
2. First launch is blocked because the app is unsigned. Get past Gatekeeper with
   **right-click (or Control-click) the app → Open → Open**. You only do this once.
   - If macOS still refuses, run once: `xattr -dr com.apple.quarantine /Applications/Perchboard.app`
3. Perchboard has **no Dock icon and no window chrome** — it lives in the
   **menu bar** (top-right). Click the menu-bar icon for **Show / Hide**,
   **Settings**, and **Quit**.

### Windows
1. Run `Perchboard-Setup-<version>.exe`.
2. SmartScreen may warn (unsigned): click **More info → Run anyway**.
3. The installer sets up the app and a Start-menu entry. The app runs from the
   **system tray** (bottom-right) — right-click the tray icon for
   **Show / Hide**, **Settings**, and **Quit**.

### Linux
1. Make the AppImage executable, then run it:
   ```bash
   chmod +x Perchboard-<version>.AppImage
   ./Perchboard-<version>.AppImage
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
