import { useState } from 'react'
import { useStore } from '../store'
import type { Task } from '../../../preload/index.d'

function Row({ task }: { task: Task }): JSX.Element {
  const startTask = useStore((s) => s.startTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const moveTask = useStore((s) => s.moveTask)
  const editTask = useStore((s) => s.editTask)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(task.name)
  const [mins, setMins] = useState(Math.round(task.durationSec / 60))

  if (editing) {
    return (
      <li className="task-row editing">
        <input
          className="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Edit name"
          autoFocus
        />
        <div className="add-dur">
          <input
            className="add-mins"
            type="number"
            min={1}
            max={600}
            value={mins}
            onChange={(e) => setMins(Number(e.target.value))}
            aria-label="Edit minutes"
          />
          <span className="add-unit">m</span>
        </div>
        <button
          className="icon-btn ok"
          title="Save"
          onClick={() => {
            editTask(task.id, name, mins)
            setEditing(false)
          }}
        >
          ✓
        </button>
        <button className="icon-btn" title="Cancel" onClick={() => setEditing(false)}>
          ✕
        </button>
      </li>
    )
  }

  const mn = Math.round(task.durationSec / 60)

  return (
    <li className={`task-row status-${task.status}`}>
      {task.status === 'pending' && (
        <button
          className="task-marker pending"
          title="Start this task now (interrupts the current one)"
          aria-label="Start task"
          onClick={() => startTask(task.id)}
        >
          <svg className="marker-glyph" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M3.2 2.2 L8 5 L3.2 7.8 Z" fill="currentColor" />
          </svg>
        </button>
      )}
      {task.status === 'active' && (
        <span className="task-marker active" title="Running" aria-label="Running">
          <span className="marker-pulse" />
        </span>
      )}
      {task.status === 'completed' && (
        <span className="task-marker done" title="Completed" aria-label="Completed">
          ✓
        </span>
      )}

      <span className="task-name">{task.name}</span>
      <span className="task-dur">
        {mn}
        <em>m</em>
      </span>

      <span className="task-actions">
        <button className="icon-btn" title="Move this task earlier in the queue" onClick={() => moveTask(task.id, -1)}>
          ↑
        </button>
        <button className="icon-btn" title="Move this task later in the queue" onClick={() => moveTask(task.id, 1)}>
          ↓
        </button>
        <button className="icon-btn" title="Edit this task's name and duration" onClick={() => setEditing(true)}>
          ✎
        </button>
        <button className="icon-btn danger" title="Delete this task" onClick={() => deleteTask(task.id)}>
          🗑
        </button>
      </span>
    </li>
  )
}

function CompletedRow({ task }: { task: Task }): JSX.Element {
  const deleteTask = useStore((s) => s.deleteTask)
  return (
    <li className="task-row status-completed">
      <span className="task-marker done" aria-label="Completed">
        ✓
      </span>
      <span className="task-name">{task.name}</span>
      <span className="task-dur">
        {Math.round(task.durationSec / 60)}
        <em>m</em>
      </span>
      <span className="task-actions">
        <button className="icon-btn danger" title="Delete" onClick={() => deleteTask(task.id)}>
          🗑
        </button>
      </span>
    </li>
  )
}

export function TaskQueue(): JSX.Element {
  const tasks = useStore((s) => s.tasks)
  const clearCompleted = useStore((s) => s.clearCompleted)
  const { done, total } = useStore((s) => s.progress())
  const [showDone, setShowDone] = useState(false)

  if (total === 0) {
    return (
      <div className="queue setting-group empty-queue">
        <div className="empty-emoji">🌱</div>
        <div className="empty-title">No tasks yet</div>
        <div className="empty-sub">Add your first one above to start focusing.</div>
      </div>
    )
  }

  const pct = Math.round((done / total) * 100)
  const openTasks = tasks.filter((t) => t.status !== 'completed')
  const completed = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="queue setting-group">
      <div className="group-head">
        <label>Tasks</label>
        <span className="group-value">
          {done}/{total} · {pct}%
        </span>
      </div>

      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {openTasks.length > 0 ? (
        <ul className="task-list">
          {openTasks.map((t) => (
            <Row key={t.id} task={t} />
          ))}
        </ul>
      ) : (
        <div className="all-done">🎉 All tasks complete — nice work!</div>
      )}

      {completed.length > 0 && (
        <div className="completed-section">
          <div className="completed-head">
            <button
              className="completed-toggle"
              onClick={() => setShowDone((v) => !v)}
              aria-expanded={showDone}
              title={showDone ? 'Hide completed tasks' : 'Show completed tasks'}
            >
              <span className={`chevron ${showDone ? 'open' : ''}`}>▸</span>
              {completed.length} completed
            </button>
            {showDone && (
              <button className="clear-done" onClick={clearCompleted} title="Delete all completed">
                Clear all
              </button>
            )}
          </div>
          {showDone && (
            <ul className="task-list done-list">
              {completed.map((t) => (
                <CompletedRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
