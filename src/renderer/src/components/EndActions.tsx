import { useState } from 'react'
import { useStore } from '../store'

// Shown when a timer hits zero (FR-008): done (default) / new timer / requeue.
export function EndActions(): JSX.Element {
  const activeTimer = useStore((s) => s.activeTimer)
  const task = useStore((s) => s.activeTask())
  const markDone = useStore((s) => s.markDone)
  const requeueActive = useStore((s) => s.requeueActive)
  const restartActive = useStore((s) => s.restartActive)
  const nextPending = useStore((s) => s.nextPending())
  const startNext = useStore((s) => s.startNext)
  const endBreak = useStore((s) => s.endBreak)
  const [mins, setMins] = useState(5)

  // A finished break: offer to start the next task (or dismiss).
  if (activeTimer?.isBreak) {
    return (
      <div className="end-actions">
        <div className="end-title">Break’s over 🌟</div>
        <div className="controls">
          <button
            className="btn primary"
            disabled={!nextPending}
            onClick={startNext}
            title={
              nextPending ? `Start the next task: ${nextPending.name}` : 'No pending tasks to start'
            }
          >
            ▶ Start next task
          </button>
          <button className="btn" onClick={endBreak} title="Dismiss and leave the timer idle">
            ✕ Dismiss
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="end-actions">
      <div className="end-title">Time’s up{task ? ` — ${task.name}` : ''}</div>
      <div className="controls">
        <button className="btn primary" onClick={markDone} title="Mark this task complete">
          ✓ Done
        </button>
        <button className="btn" onClick={requeueActive} title="Redo later — send this task to the end of the queue">
          ⤓ Do later
        </button>
      </div>
      <div className="end-more">
        <span>More time:</span>
        <input
          type="number"
          min={1}
          max={600}
          value={mins}
          onChange={(e) => setMins(Number(e.target.value))}
        />
        <span>min</span>
        <button
          className="btn"
          onClick={() => restartActive(mins)}
          title={`Restart this task with ${mins} more minute${mins === 1 ? '' : 's'}`}
        >
          ↻ Restart
        </button>
      </div>
    </div>
  )
}
