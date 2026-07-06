# Perchboard

A minimal, always-on-top **overlay timer** and per-day task manager for macOS,
Windows, and Linux. Add the day's tasks with a time budget each, then work
through them one at a time while a large countdown floats above all your windows.

> *A floating focus timer for your daily tasks.*

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the full spec.

## Stack
Electron + React + TypeScript, bundled with [electron-vite](https://electron-vite.org).
State in [Zustand](https://github.com/pmndrs/zustand); local persistence via
[electron-store](https://github.com/sindresorhus/electron-store).

## Develop
```bash
npm install        # also generates bundled ding + tray icon (scripts/gen-assets.cjs)
npm run dev        # launch with hot reload
```

## Other commands
```bash
npm run typecheck  # tsc for main + renderer
npm run build      # production bundle into out/
npm run dist       # build + package installers (dmg / nsis / AppImage) via electron-builder
```

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
  with more time.
- Data is local-only and resets to a fresh list each new day.

### Project layout
```
src/main/      Electron main process — window, tray, hotkeys, IPC, persistence
src/preload/   contextBridge API + shared types
src/renderer/  React UI (store, hooks, components, themes, styles)
scripts/       gen-assets.cjs — embeds the ding sound + tray icon as data URLs
```
