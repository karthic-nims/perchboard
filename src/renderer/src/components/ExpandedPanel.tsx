import { useStore } from '../store'
import { Controls } from './Controls'
import { EndActions } from './EndActions'
import { BreakPrompt } from './BreakPrompt'
import { AddTaskForm } from './AddTaskForm'
import { TaskQueue } from './TaskQueue'
import { SettingsPanel } from './SettingsPanel'
import { HelpPanel } from './HelpPanel'

export type PanelTab = 'tasks' | 'settings' | 'help'

interface Props {
  tab: PanelTab
  setTab: (t: PanelTab) => void
  hotkeyFailed: string[]
  setHotkeyFailed: (f: string[]) => void
  pinnedHint: boolean
  onDismissHint: () => void
  setModalOpen: (open: boolean) => void
}

export function ExpandedPanel({
  tab,
  setTab,
  hotkeyFailed,
  setHotkeyFailed,
  pinnedHint,
  onDismissHint,
  setModalOpen
}: Props): JSX.Element {
  const ended = useStore((s) => s.ended)
  const breakPrompt = useStore((s) => s.breakPrompt)
  const showInTaskbar = useStore((s) => s.settings.showInTaskbar)

  return (
    <div className="panel">
      <div className="panel-tabs">
        <button
          className={`tab ${tab === 'tasks' ? 'sel' : ''}`}
          onClick={() => setTab('tasks')}
          title="View and manage your task list"
        >
          Tasks
        </button>
        <button
          className={`tab ${tab === 'settings' ? 'sel' : ''}`}
          onClick={() => setTab('settings')}
          title="Open appearance, sound and hotkey settings"
        >
          Settings
        </button>
        <button
          className={`tab ${tab === 'help' ? 'sel' : ''}`}
          onClick={() => setTab('help')}
          title="How to use the app — a quick reference"
        >
          Help
        </button>
        <div className="spacer" />
        {showInTaskbar && (
          <button
            className="icon-btn"
            title="Minimize to the taskbar/Dock"
            onClick={() => window.api.minimize()}
          >
            <svg className="min-glyph" viewBox="0 0 10 10" aria-hidden="true">
              <rect x="1.3" y="4.4" width="7.4" height="1.3" rx="0.65" fill="currentColor" />
            </svg>
          </button>
        )}
        <button
          className="icon-btn"
          title="Hide the overlay (reopen it with your show/hide hotkey)"
          onClick={() => window.api.hide()}
        >
          ▾
        </button>
      </div>

      {pinnedHint && (
        <div className="hint">
          👋 Add tasks, then hover the timer to control them. This panel hides itself when you move
          away.
          <button className="btn small" onClick={onDismissHint} title="Dismiss this tip">
            Got it
          </button>
        </div>
      )}

      {tab === 'settings' ? (
        <SettingsPanel
          hotkeyFailed={hotkeyFailed}
          setHotkeyFailed={setHotkeyFailed}
          setModalOpen={setModalOpen}
        />
      ) : tab === 'help' ? (
        <HelpPanel />
      ) : (
        <>
          {breakPrompt ? <BreakPrompt /> : ended ? <EndActions /> : <Controls />}
          <AddTaskForm />
          <TaskQueue />
        </>
      )}
    </div>
  )
}
