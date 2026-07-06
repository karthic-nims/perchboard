import { useStore } from '../store'

// Prettify an Electron accelerator into readable key symbols.
function prettyKeys(accel: string): string {
  return accel
    .replace('CommandOrControl', '⌘/Ctrl')
    .replace('Alt', '⌥Alt')
    .replace('Shift', '⇧Shift')
    .split('+')
    .join(' + ')
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="help-section">
      <div className="help-h">{title}</div>
      <ul className="help-list">{children}</ul>
    </div>
  )
}

export function HelpPanel(): JSX.Element {
  const hotkeys = useStore((s) => s.hotkeys)
  const warningSec = useStore((s) => s.settings.warningSec)

  return (
    <div className="help">
      <p className="help-intro">
        A minimal always-on-top timer for working through a daily task list — one focused block at a
        time, with a nudge to take breaks.
      </p>

      <Section title="The overlay">
        <li>
          <b>Drag</b> the timer to reposition it anywhere on screen.
        </li>
        <li>
          <b>Click</b> the timer to pause or resume the countdown.
        </li>
        <li>
          <b>Hover</b> the timer to open this panel; it hides again when you move away.
        </li>
      </Section>

      <Section title="Tasks">
        <li>
          Type a name, set the minutes (or tap a preset), then <b>+</b> to add it.
        </li>
        <li>
          <b>▶</b> start · <b>↑ ↓</b> reorder · <b>✎</b> edit · <b>🗑</b> delete.
        </li>
        <li>The progress bar shows how many tasks you’ve completed today.</li>
        <li>The list resets automatically each new day.</li>
      </Section>

      <Section title="Running a timer">
        <li>
          <b>Pause / Resume</b> — stop and restart the countdown.
        </li>
        <li>
          <b>Done</b> — finish the task early. <b>Skip</b> — send it to the end of the queue.
        </li>
        <li>
          <b>Reset</b> — restore the full duration.
        </li>
      </Section>

      <Section title="When time’s up">
        <li>
          <b>Done</b> marks it complete · <b>Do later</b> requeues it.
        </li>
        <li>
          <b>Restart</b> gives the task more minutes if you need them.
        </li>
      </Section>

      <Section title="Breaks">
        <li>Finishing a task suggests a rest break — take it or skip it.</li>
        <li>
          Turn on <b>Auto-start next task</b> in Settings to roll straight into the next one.
        </li>
      </Section>

      <Section title="Ending warning">
        <li>
          In the last {warningSec > 0 ? `${warningSec}s` : 'few seconds'} the timer pulses{' '}
          <span className="help-warn">amber</span> so you know it’s about to end.
        </li>
        <li>Adjust the lead time (or turn it off) and toggle the chime under Settings.</li>
      </Section>

      <Section title="Global hotkeys">
        <li>
          Show / Hide — <span className="kbd">{prettyKeys(hotkeys.toggle)}</span>
        </li>
        <li>
          Start — <span className="kbd">{prettyKeys(hotkeys.start)}</span>
        </li>
        <li>
          Pause / Resume — <span className="kbd">{prettyKeys(hotkeys.stop)}</span>
        </li>
        <li>Rebind any of these under Settings › Hotkeys.</li>
      </Section>

      <Section title="Window & tray">
        <li>The menu-bar / tray icon can Show/Hide, open Settings, or Quit.</li>
        <li>
          Enable <b>Show in taskbar / Dock</b> to get a normal window you can minimize with the{' '}
          <b>—</b> button.
        </li>
      </Section>

      <Section title="Make it yours">
        <li>Pick a theme (or build a custom one), font, and overlay size under Settings.</li>
        <li>Control sound, desktop notifications, launch-at-login, and break length there too.</li>
      </Section>
    </div>
  )
}
