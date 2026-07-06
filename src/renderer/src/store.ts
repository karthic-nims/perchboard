import { create } from 'zustand'
import type {
  ActiveTimer,
  Appearance,
  HotkeyBindings,
  PersistedState,
  Settings,
  Task
} from '../../preload/index.d'

function now(): number {
  return Date.now()
}

function nextOrder(tasks: Task[]): number {
  return tasks.reduce((m, t) => Math.max(m, t.order), -1) + 1
}

function sortByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order)
}

interface AppState {
  loaded: boolean
  tasks: Task[]
  activeTimer: ActiveTimer | null
  ended: boolean // timer reached zero, awaiting user action (FR-008)
  breakPrompt: boolean // a task just completed; insisting on a rest break
  appearance: Appearance
  hotkeys: HotkeyBindings
  settings: Settings
  firstRunDone: boolean

  init: () => Promise<void>
  // tasks
  addTask: (name: string, minutes: number) => void
  editTask: (id: string, name: string, minutes: number) => void
  deleteTask: (id: string) => void
  clearCompleted: () => void
  moveTask: (id: string, dir: -1 | 1) => void
  // timer control
  startTask: (id: string) => void
  startNext: () => void
  pauseResume: () => void
  resetActive: () => void
  skipActive: () => void
  completeEarly: () => void
  // end-of-timer outcomes (FR-008/008a/008b)
  endTimer: () => void
  markDone: () => void
  requeueActive: () => void
  restartActive: (minutes: number) => void
  // rest breaks
  startBreak: (minutes: number) => void
  skipBreak: () => void
  endBreak: () => void
  // settings / appearance / hotkeys
  setAppearance: (patch: Partial<Appearance>) => void
  setSettings: (patch: Partial<Settings>) => void
  setHotkeys: (h: HotkeyBindings) => void
  markFirstRunDone: () => void

  activeTask: () => Task | undefined
  nextPending: () => Task | undefined
  progress: () => { done: number; total: number }
}

function persist(patch: Partial<PersistedState>): void {
  window.api.saveState(patch)
}

export const useStore = create<AppState>((set, get) => ({
  loaded: false,
  tasks: [],
  activeTimer: null,
  ended: false,
  breakPrompt: false,
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
  firstRunDone: false,

  init: async () => {
    const s = await window.api.loadState()
    const ended =
      !!s.activeTimer && !s.activeTimer.paused && s.activeTimer.endAt <= now() // FR-025
    set({
      loaded: true,
      tasks: sortByOrder(s.tasks),
      activeTimer: s.activeTimer,
      ended,
      breakPrompt: false,
      appearance: { ...get().appearance, ...s.appearance },
      hotkeys: s.hotkeys,
      settings: { ...get().settings, ...s.settings },
      firstRunDone: s.firstRunDone
    })
  },

  addTask: (name, minutes) => {
    const trimmed = name.trim()
    const mins = Math.max(1, Math.min(600, Math.round(minutes)))
    if (!trimmed) return
    const tasks = get().tasks
    const task: Task = {
      id: crypto.randomUUID(),
      name: trimmed,
      durationSec: mins * 60,
      status: 'pending',
      order: nextOrder(tasks)
    }
    const updated = [...tasks, task]
    set({ tasks: updated })
    persist({ tasks: updated })
  },

  editTask: (id, name, minutes) => {
    const trimmed = name.trim()
    const mins = Math.max(1, Math.min(600, Math.round(minutes)))
    if (!trimmed) return
    const updated = get().tasks.map((t) =>
      t.id === id ? { ...t, name: trimmed, durationSec: mins * 60 } : t
    )
    set({ tasks: updated })
    persist({ tasks: updated })
  },

  deleteTask: (id) => {
    const active = get().activeTimer
    const updated = get().tasks.filter((t) => t.id !== id)
    const patch: Partial<PersistedState> = { tasks: updated }
    set({ tasks: updated })
    if (active?.taskId === id) {
      set({ activeTimer: null, ended: false })
      patch.activeTimer = null
    }
    persist(patch)
  },

  clearCompleted: () => {
    const updated = get().tasks.filter((t) => t.status !== 'completed')
    set({ tasks: updated })
    persist({ tasks: updated })
  },

  moveTask: (id, dir) => {
    const ordered = sortByOrder(get().tasks)
    const idx = ordered.findIndex((t) => t.id === id)
    const swap = idx + dir
    if (idx < 0 || swap < 0 || swap >= ordered.length) return
    const a = ordered[idx]
    const b = ordered[swap]
    const tmp = a.order
    a.order = b.order
    b.order = tmp
    const updated = sortByOrder(ordered)
    set({ tasks: updated })
    persist({ tasks: updated })
  },

  startTask: (id) => {
    const tasks = get().tasks.map((t) => {
      if (t.id === id) return { ...t, status: 'active' as const }
      if (t.status === 'active') return { ...t, status: 'pending' as const }
      return t
    })
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const timer: ActiveTimer = {
      taskId: id,
      endAt: now() + task.durationSec * 1000,
      paused: false,
      remainingSec: task.durationSec
    }
    set({ tasks, activeTimer: timer, ended: false })
    persist({ tasks, activeTimer: timer })
  },

  startNext: () => {
    const next = get().nextPending()
    if (next) get().startTask(next.id)
  },

  pauseResume: () => {
    const at = get().activeTimer
    if (!at || get().ended) return
    let updated: ActiveTimer
    if (at.paused) {
      updated = { ...at, paused: false, endAt: now() + at.remainingSec * 1000 }
    } else {
      const remaining = Math.max(0, Math.round((at.endAt - now()) / 1000))
      updated = { ...at, paused: true, remainingSec: remaining }
    }
    set({ activeTimer: updated })
    persist({ activeTimer: updated })
  },

  resetActive: () => {
    const at = get().activeTimer
    if (!at) return
    const task = get().tasks.find((t) => t.id === at.taskId)
    if (!task) return
    const updated: ActiveTimer = {
      taskId: at.taskId,
      endAt: now() + task.durationSec * 1000,
      paused: at.paused,
      remainingSec: task.durationSec
    }
    set({ activeTimer: updated, ended: false })
    persist({ activeTimer: updated })
  },

  skipActive: () => {
    // Move the active (or next pending) task to the end of the queue (FR-009).
    const at = get().activeTimer
    const target = at ? get().tasks.find((t) => t.id === at.taskId) : get().nextPending()
    if (!target) return
    const maxOrder = nextOrder(get().tasks)
    const updated = sortByOrder(
      get().tasks.map((t) =>
        t.id === target.id ? { ...t, status: 'pending' as const, order: maxOrder } : t
      )
    )
    const clearTimer = at?.taskId === target.id
    set({ tasks: updated, ...(clearTimer ? { activeTimer: null, ended: false } : {}) })
    persist({ tasks: updated, ...(clearTimer ? { activeTimer: null } : {}) })
  },

  completeEarly: () => get().markDone(),

  endTimer: () => {
    const at = get().activeTimer
    if (!at || get().ended) return
    // A finished break can auto-advance straight into the next task.
    if (at.isBreak && get().settings.autoStartNext && get().nextPending()) {
      get().startNext()
      return
    }
    // Freeze remaining at 0; await user action while blinking (FR-008).
    const updated: ActiveTimer = { ...at, paused: true, remainingSec: 0 }
    set({ ended: true, activeTimer: updated })
    persist({ activeTimer: updated })
  },

  markDone: () => {
    const at = get().activeTimer
    const tasks = get().tasks.map((t) =>
      t.id === at?.taskId ? { ...t, status: 'completed' as const } : t
    )
    // A completed task always prompts a rest break (user can accept/deny).
    set({ tasks, activeTimer: null, ended: false, breakPrompt: true })
    persist({ tasks, activeTimer: null }) // queue advances but does NOT auto-start (FR-007)
  },

  startBreak: (minutes) => {
    const mins = Math.max(1, Math.min(600, Math.round(minutes)))
    const sec = mins * 60
    const timer: ActiveTimer = {
      taskId: '',
      endAt: now() + sec * 1000,
      paused: false,
      remainingSec: sec,
      isBreak: true
    }
    set({ activeTimer: timer, ended: false, breakPrompt: false })
    persist({ activeTimer: timer })
  },

  skipBreak: () => {
    set({ breakPrompt: false })
    if (get().settings.autoStartNext && get().nextPending()) get().startNext()
  },

  endBreak: () => {
    set({ activeTimer: null, ended: false, breakPrompt: false })
    persist({ activeTimer: null })
  },

  requeueActive: () => {
    const at = get().activeTimer
    if (!at) return
    const maxOrder = nextOrder(get().tasks)
    const tasks = sortByOrder(
      get().tasks.map((t) =>
        t.id === at.taskId ? { ...t, status: 'pending' as const, order: maxOrder } : t
      )
    )
    set({ tasks, activeTimer: null, ended: false })
    persist({ tasks, activeTimer: null })
  },

  restartActive: (minutes) => {
    const at = get().activeTimer
    if (!at) return
    const mins = Math.max(1, Math.min(600, Math.round(minutes)))
    const sec = mins * 60
    const tasks = get().tasks.map((t) =>
      t.id === at.taskId ? { ...t, durationSec: sec, status: 'active' as const } : t
    )
    const timer: ActiveTimer = { taskId: at.taskId, endAt: now() + sec * 1000, paused: false, remainingSec: sec }
    set({ tasks, activeTimer: timer, ended: false })
    persist({ tasks, activeTimer: timer })
  },

  setAppearance: (patch) => {
    const appearance = { ...get().appearance, ...patch }
    set({ appearance })
    persist({ appearance })
  },

  setSettings: (patch) => {
    const settings = { ...get().settings, ...patch }
    set({ settings })
    persist({ settings })
    if ('launchAtLogin' in patch) window.api.setLaunchAtLogin(settings.launchAtLogin)
    if ('showInTaskbar' in patch) window.api.setTaskbarMode(settings.showInTaskbar)
  },

  setHotkeys: (h) => {
    set({ hotkeys: h })
    persist({ hotkeys: h })
  },

  markFirstRunDone: () => {
    if (get().firstRunDone) return
    set({ firstRunDone: true })
    persist({ firstRunDone: true })
  },

  activeTask: () => {
    const at = get().activeTimer
    return at ? get().tasks.find((t) => t.id === at.taskId) : undefined
  },
  nextPending: () => sortByOrder(get().tasks).find((t) => t.status === 'pending'),
  progress: () => {
    const tasks = get().tasks
    return { done: tasks.filter((t) => t.status === 'completed').length, total: tasks.length }
  }
}))
