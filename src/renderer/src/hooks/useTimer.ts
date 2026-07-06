import { useEffect, useState } from 'react'
import type { ActiveTimer } from '../../../preload/index.d'

/**
 * Derives the remaining seconds from an ActiveTimer using end-timestamp math
 * (no interval drift, NFR-003). Calls onEnd once when a running timer crosses 0.
 */
export function useTimer(
  activeTimer: ActiveTimer | null,
  ended: boolean,
  onEnd: () => void
): number {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    function compute(): number {
      if (!activeTimer) return 0
      if (activeTimer.paused) return activeTimer.remainingSec
      return Math.max(0, Math.round((activeTimer.endAt - Date.now()) / 1000))
    }

    setRemaining(compute())
    if (!activeTimer || activeTimer.paused) return

    const id = setInterval(() => {
      const r = compute()
      setRemaining(r)
      if (r <= 0 && !ended) onEnd()
    }, 250)
    return () => clearInterval(id)
  }, [activeTimer, ended, onEnd])

  return remaining
}

export function formatTime(totalSec: number): string {
  const s = Math.max(0, totalSec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number): string => String(n).padStart(2, '0')
  // MM:SS, switching to H:MM:SS only for tasks >= 60 min (FR-003).
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}
