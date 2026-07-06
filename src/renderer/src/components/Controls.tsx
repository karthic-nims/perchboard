import { useStore } from '../store'

export function Controls(): JSX.Element {
  const activeTimer = useStore((s) => s.activeTimer)
  const ended = useStore((s) => s.ended)
  const nextPending = useStore((s) => s.nextPending())
  const startNext = useStore((s) => s.startNext)
  const pauseResume = useStore((s) => s.pauseResume)
  const resetActive = useStore((s) => s.resetActive)
  const skipActive = useStore((s) => s.skipActive)
  const completeEarly = useStore((s) => s.completeEarly)
  const endBreak = useStore((s) => s.endBreak)

  if (ended) return <></>

  // Break in progress: pause or end early.
  if (activeTimer?.isBreak) {
    return (
      <div className="controls">
        <button
          className="btn"
          onClick={pauseResume}
          title={activeTimer.paused ? 'Resume the break countdown' : 'Pause the break countdown'}
        >
          {activeTimer.paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button className="btn" onClick={endBreak} title="End the break now and return to your tasks">
          ✓ End break
        </button>
      </div>
    )
  }

  if (!activeTimer) {
    return (
      <div className="controls">
        <button
          className="btn primary"
          disabled={!nextPending}
          onClick={startNext}
          title={
            nextPending
              ? `Start the next task: ${nextPending.name}`
              : 'No pending tasks to start'
          }
        >
          ▶ Start next
        </button>
      </div>
    )
  }

  return (
    <div className="controls">
      <button
        className="btn"
        onClick={pauseResume}
        title={activeTimer.paused ? 'Resume the countdown' : 'Pause the countdown'}
      >
        {activeTimer.paused ? '▶ Resume' : '⏸ Pause'}
      </button>
      <button className="btn" onClick={completeEarly} title="Mark this task done before the timer ends">
        ✓ Done
      </button>
      <button className="btn" onClick={skipActive} title="Skip this task — send it to the end of the queue">
        ⤓ Skip
      </button>
      <button className="btn" onClick={resetActive} title="Reset the countdown to the task's full duration">
        ↺ Reset
      </button>
    </div>
  )
}
