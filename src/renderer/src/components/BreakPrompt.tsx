import { useState } from 'react'
import { useStore } from '../store'

// Shown after a task is completed — the app insists on a rest break (accept/deny).
export function BreakPrompt(): JSX.Element {
  const settings = useStore((s) => s.settings)
  const startBreak = useStore((s) => s.startBreak)
  const skipBreak = useStore((s) => s.skipBreak)
  const nextPending = useStore((s) => s.nextPending())
  const [mins, setMins] = useState(settings.breakMinutes || 5)

  const allDone = !nextPending

  return (
    <div className={`break-prompt ${allDone ? 'celebrate' : ''}`}>
      <div className="break-emoji">{allDone ? '🎉' : '☕'}</div>
      <div className="break-title">
        {allDone ? 'That’s everything — you crushed it!' : 'Nice work — take a break'}
      </div>
      <div className="break-sub">
        {allDone
          ? 'Your whole list is done. Go enjoy the rest of your day! 🌞'
          : 'Step away for a few minutes to recharge.'}
      </div>

      <div className="break-len">
        <button
          className="step-btn"
          title="Shorten the break by one minute"
          onClick={() => setMins((m) => Math.max(1, m - 1))}
        >
          −
        </button>
        <span className="break-mins">
          {mins}
          <em>min</em>
        </span>
        <button
          className="step-btn"
          title="Extend the break by one minute"
          onClick={() => setMins((m) => Math.min(600, m + 1))}
        >
          +
        </button>
      </div>

      <div className="controls">
        <button
          className="btn primary"
          onClick={() => startBreak(mins)}
          title={`Start a ${mins}-minute break timer`}
        >
          ☕ Take a break
        </button>
        <button
          className="btn"
          onClick={skipBreak}
          title={
            allDone
              ? 'Wrap up for the day'
              : settings.autoStartNext && nextPending
                ? 'Skip the break and start the next task'
                : 'Skip the break'
          }
        >
          {allDone
            ? '🌴 Wrap up for the day'
            : settings.autoStartNext && nextPending
              ? '↦ Skip to next'
              : '✕ Skip break'}
        </button>
      </div>
    </div>
  )
}
