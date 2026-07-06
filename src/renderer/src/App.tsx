import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { useTimer } from './hooks/useTimer'
import { resolveTheme } from './themes'
import { dingDataUrl, warnDataUrl } from './assets'
import { TimerDisplay } from './components/TimerDisplay'
import { ExpandedPanel } from './components/ExpandedPanel'
import type { PanelTab } from './components/ExpandedPanel'
import type { AppEvent } from '../../preload/index.d'

const DRAG_THRESHOLD = 5 // px; below this a press counts as a click (FR-024)

export function App(): JSX.Element {
  const store = useStore()
  const cardRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const warnAudioRef = useRef<HTMLAudioElement | null>(null)
  const warnedRef = useRef(false)

  const [expanded, setExpanded] = useState(false) // cursor over card → full panel shown
  const [tab, setTab] = useState<PanelTab>('tasks')
  const [pinned, setPinned] = useState(false) // first-run hint keeps panel open
  const [hotkeyFailed, setHotkeyFailed] = useState<string[]>([])

  const dragRef = useRef<{
    active: boolean
    moved: number
    startX: number
    startY: number
    winX: number
    winY: number
  } | null>(null)

  // true while a native OS dialog (color picker) is open — suppresses auto-collapse
  const modalOpenRef = useRef(false)
  const setModalOpen = useCallback((open: boolean) => {
    modalOpenRef.current = open
  }, [])

  const remaining = useTimer(
    store.activeTimer,
    store.ended,
    useCallback(() => useStore.getState().endTimer(), [])
  )

  // ---- load + wire hotkeys + app events ----
  useEffect(() => {
    void useStore.getState().init().then(async () => {
      const s = useStore.getState()
      const { failed } = await window.api.registerHotkeys(s.hotkeys)
      setHotkeyFailed(failed)
      if (!s.firstRunDone) {
        setPinned(true)
        setExpanded(true)
      }
    })

    const off = window.api.onAppEvent((ev: AppEvent) => {
      const st = useStore.getState()
      switch (ev) {
        case 'start':
          if (st.ended) break
          if (!st.activeTimer) st.startNext()
          else if (st.activeTimer.paused) st.pauseResume()
          break
        case 'stop':
          st.pauseResume()
          break
        case 'settings':
          setPinned(true)
          setExpanded(true)
          setTab('settings')
          break
      }
    })
    return off
  }, [])

  // ---- apply theme / font / scale ----
  useEffect(() => {
    const t = resolveTheme(store.appearance)
    const root = document.documentElement
    root.style.setProperty('--bg', t.bg)
    root.style.setProperty('--fg', t.fg)
    root.style.setProperty('--muted', t.muted)
    root.style.setProperty('--accent', t.accent)
    root.style.setProperty('--surface', t.surface)
    root.style.setProperty('--border', t.border)
    root.style.setProperty('--timer', t.timer)
    root.style.setProperty('--font', store.appearance.fontFamily || 'system-ui')
    root.style.setProperty('--scale', String(store.appearance.size))
  }, [store.appearance])

  // ---- ding + notification when a timer ends ----
  const prevEnded = useRef(store.ended)
  useEffect(() => {
    if (store.ended && !prevEnded.current) {
      const { settings, activeTask } = useStore.getState()
      const task = activeTask()
      if (!settings.muted) {
        if (!audioRef.current) audioRef.current = new Audio(dingDataUrl)
        audioRef.current.volume = settings.volume
        audioRef.current.currentTime = 0
        void audioRef.current.play().catch(() => {})
      }
      if (settings.notifications && task) {
        window.api.notify('Time is up', `"${task.name}" — ${remaining <= 0 ? 'done' : ''}`.trim())
      }
    }
    prevEnded.current = store.ended
  }, [store.ended, remaining])

  // ---- click-through: interactive only when the cursor is over the card (FR-022) ----
  useEffect(() => {
    function onMove(e: MouseEvent): void {
      const drag = dragRef.current
      if (drag?.active) {
        const dx = e.screenX - drag.startX
        const dy = e.screenY - drag.startY
        drag.moved = Math.max(drag.moved, Math.hypot(dx, dy))
        window.api.setWindowPosition(drag.winX + dx, drag.winY + dy)
        return
      }
      const card = cardRef.current
      if (!card) return
      const r = card.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      if (inside) {
        window.api.setIgnoreMouse(false)
        setExpanded(true)
      } else if (!pinned && !modalOpenRef.current) {
        // keep the panel open while a native picker (e.g. the color dialog) is up
        window.api.setIgnoreMouse(true)
        setExpanded(false)
        setTab('tasks')
      }
    }
    function onUp(): void {
      const drag = dragRef.current
      if (drag?.active) {
        if (drag.moved < DRAG_THRESHOLD) useStore.getState().pauseResume() // click = pause/resume
        dragRef.current = null
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [pinned])

  const startDrag = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    const { x, y } = await window.api.getWindowPosition()
    dragRef.current = { active: true, moved: 0, startX: e.screenX, startY: e.screenY, winX: x, winY: y }
  }, [])

  const dismissHint = useCallback(() => {
    setPinned(false)
    useStore.getState().markFirstRunDone()
  }, [])

  // "About to end" warning: active, running task within the warning lead time.
  const at = store.activeTimer
  const warningSec = store.settings.warningSec
  const endingSoon =
    !!at && !at.paused && !store.ended && warningSec > 0 && remaining > 0 && remaining <= warningSec

  // Soft chime once when the countdown crosses into the warning window.
  useEffect(() => {
    if (endingSoon && !warnedRef.current) {
      warnedRef.current = true
      const { settings } = useStore.getState()
      if (!settings.muted && settings.warningSound) {
        if (!warnAudioRef.current) warnAudioRef.current = new Audio(warnDataUrl)
        warnAudioRef.current.volume = settings.volume
        warnAudioRef.current.currentTime = 0
        void warnAudioRef.current.play().catch(() => {})
      }
    }
    if (!endingSoon) warnedRef.current = false
  }, [endingSoon])

  if (!store.loaded) return <div className="app" />

  const isBlinking = store.ended
  const mode = expanded ? 'expanded' : 'collapsed'

  return (
    <div className="app">
      <div ref={cardRef} className={`card ${mode} ${endingSoon ? 'ending-soon' : ''}`}>
        {expanded && (
          <button className="close-btn" title="Quit timer" onClick={() => window.api.quit()}>
            ✕
          </button>
        )}
        <TimerDisplay
          remaining={remaining}
          blinking={isBlinking}
          endingSoon={endingSoon}
          paused={!!store.activeTimer?.paused && !store.ended}
          showLabel={expanded}
          onMouseDown={startDrag}
        />
        {expanded && (
          <ExpandedPanel
            tab={tab}
            setTab={setTab}
            hotkeyFailed={hotkeyFailed}
            setHotkeyFailed={setHotkeyFailed}
            pinnedHint={pinned}
            onDismissHint={dismissHint}
            setModalOpen={setModalOpen}
          />
        )}
      </div>
    </div>
  )
}
