// Shared types for the IPC bridge, consumed by the renderer.

export type TaskStatus = 'pending' | 'active' | 'completed' | 'skipped'

export interface Task {
  id: string
  name: string
  durationSec: number
  status: TaskStatus
  order: number
}

export interface ActiveTimer {
  taskId: string
  endAt: number // epoch ms; remaining derived from this
  paused: boolean
  remainingSec: number // authoritative while paused
  isBreak?: boolean // a rest break rather than a task (no taskId)
}

export interface Appearance {
  theme: string // predefined theme id, or 'custom'
  fontFamily: string
  size: number // scale multiplier, e.g. 1.0
  custom: { bg: string; fg: string; accent: string } // hex colors for the custom theme
}

export interface HotkeyBindings {
  toggle: string
  start: string
  stop: string
}

export interface Settings {
  launchAtLogin: boolean
  clickThrough: boolean
  volume: number // 0..1
  muted: boolean
  notifications: boolean
  autoStartNext: boolean // auto-start the next pending task after a task/break
  breakMinutes: number // default rest-break length, minutes
  warningSec: number // "about to end" warning lead time, seconds (0 = off)
  warningSound: boolean // play a soft chime when the warning window begins
  showInTaskbar: boolean // show in the OS taskbar/Dock and allow minimize
}

export interface PersistedState {
  day: string
  tasks: Task[]
  activeTimer: ActiveTimer | null
  appearance: Appearance
  hotkeys: HotkeyBindings
  windowPosition: { x: number; y: number } | null
  settings: Settings
  firstRunDone: boolean
}

export type HotkeyAction = 'toggle' | 'start' | 'stop'
// Events pushed from main to the renderer (hotkeys + tray "Settings").
export type AppEvent = HotkeyAction | 'settings'

export interface Api {
  loadState(): Promise<PersistedState>
  saveState(patch: Partial<PersistedState>): Promise<void>
  setIgnoreMouse(ignore: boolean): void
  getWindowPosition(): Promise<{ x: number; y: number }>
  setWindowPosition(x: number, y: number): void
  resizeWindow(width: number, height: number): void
  notify(title: string, body: string): void
  listFonts(): Promise<string[]>
  setLaunchAtLogin(enabled: boolean): void
  registerHotkeys(bindings: HotkeyBindings): Promise<{ failed: HotkeyAction[] }>
  onAppEvent(cb: (event: AppEvent) => void): () => void
  hide(): void
  minimize(): void
  setTaskbarMode(enabled: boolean): void
  quit(): void
}

declare global {
  interface Window {
    api: Api
  }
}
