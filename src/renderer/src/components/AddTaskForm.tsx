import { useState } from 'react'
import { useStore } from '../store'

const PRESETS = [15, 25, 45, 60]

export function AddTaskForm(): JSX.Element {
  const addTask = useStore((s) => s.addTask)
  const [name, setName] = useState('')
  const [mins, setMins] = useState(25)

  function submit(e: React.FormEvent): void {
    e.preventDefault()
    if (!name.trim()) return
    addTask(name, mins)
    setName('')
    setMins(25)
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <div className="add-main">
        <input
          className="add-name"
          placeholder="Add a task…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Task name"
        />
        <div className="add-dur">
          <input
            className="add-mins"
            type="number"
            min={1}
            max={600}
            value={mins}
            onChange={(e) => setMins(Number(e.target.value))}
            aria-label="Minutes"
          />
          <span className="add-unit">m</span>
        </div>
        <button className="add-submit" type="submit" disabled={!name.trim()} title="Add task">
          +
        </button>
      </div>
      <div className="add-presets">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            className={`preset ${mins === p ? 'sel' : ''}`}
            onClick={() => setMins(p)}
            title={`Set the new task's duration to ${p} minutes`}
          >
            {p}m
          </button>
        ))}
      </div>
    </form>
  )
}
