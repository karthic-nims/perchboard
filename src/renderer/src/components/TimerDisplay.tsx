import { useStore } from '../store'
import { formatTime } from '../hooks/useTimer'

interface Props {
  remaining: number
  blinking: boolean
  endingSoon: boolean
  paused: boolean
  showLabel: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export function TimerDisplay({
  remaining,
  blinking,
  endingSoon,
  paused,
  showLabel,
  onMouseDown
}: Props): JSX.Element {
  const activeTask = useStore((s) => s.activeTask())
  const nextPending = useStore((s) => s.nextPending())
  const onBreak = useStore((s) => s.activeTimer?.isBreak ?? false)

  // Idle / empty state (FR-019)
  const label = onBreak ? '☕ Break' : (activeTask?.name ?? nextPending?.name ?? 'No tasks')
  const display = activeTask || onBreak || blinking ? formatTime(remaining) : '00:00'

  return (
    <div
      className={`timer ${blinking ? 'blinking' : ''} ${onBreak ? 'on-break' : ''} ${
        endingSoon ? 'ending-soon' : ''
      }`}
      onMouseDown={onMouseDown}
      title="Drag to move · click to pause/resume"
    >
      <div className="timer-value">{display}</div>
      {showLabel && (
        <div className="timer-label">
          {paused ? '⏸ ' : ''}
          {label}
        </div>
      )}
    </div>
  )
}
