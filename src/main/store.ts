import Store from 'electron-store'
import type { PersistedState } from '../preload/index.d'

export function todayKey(d = new Date()): string {
  // Local-date marker YYYY-MM-DD
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const defaultState: PersistedState = {
  day: todayKey(),
  tasks: [],
  activeTimer: null,
  appearance: {
    theme: 'aurora',
    fontFamily: 'system-ui',
    size: 1,
    custom: { bg: '#1e293b', fg: '#e2e8f0', accent: '#38bdf8' }
  },
  hotkeys: {
    toggle: 'CommandOrControl+Alt+Shift+T',
    start: 'CommandOrControl+Alt+Shift+S',
    stop: 'CommandOrControl+Alt+Shift+E'
  },
  windowPosition: null,
  settings: {
    launchAtLogin: false,
    clickThrough: true,
    volume: 0.8,
    muted: false,
    notifications: true,
    autoStartNext: false,
    breakMinutes: 5,
    warningSec: 60,
    warningSound: true,
    showInTaskbar: false
  },
  firstRunDone: false
}

const store = new Store<PersistedState>({ defaults: defaultState })

/** Load state, applying the daily reset (FR-012) on launch. */
export function loadState(): PersistedState {
  const saved = store.store
  const state = {
    ...defaultState,
    ...saved,
    // deep-merge nested objects so new fields fall back to defaults (FR-013)
    settings: { ...defaultState.settings, ...saved.settings },
    appearance: { ...defaultState.appearance, ...saved.appearance }
  } as PersistedState
  const today = todayKey()
  if (state.day !== today) {
    // New day → fresh task list; keep appearance / hotkeys / settings.
    state.day = today
    state.tasks = []
    state.activeTimer = null
    store.set('day', today)
    store.set('tasks', [])
    store.set('activeTimer', null)
  }
  return state
}

export function saveState(patch: Partial<PersistedState>): void {
  for (const [k, v] of Object.entries(patch)) {
    store.set(k, v as never)
  }
}
