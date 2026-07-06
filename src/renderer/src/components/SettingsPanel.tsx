import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { THEMES, THEME_CATEGORIES, hexToRgba, resolveTheme } from '../themes'
import type { ThemeCategory } from '../themes'
import type { HotkeyAction, HotkeyBindings } from '../../../preload/index.d'

const COMMON_FONTS = ['system-ui', 'Arial', 'Helvetica', 'Georgia', 'Courier New', 'Menlo', 'Consolas']

function formatWarn(sec: number): string {
  if (sec <= 0) return 'Off'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}

function eventToAccelerator(e: KeyboardEvent): string | null {
  const mods: string[] = []
  if (e.metaKey || e.ctrlKey) mods.push('CommandOrControl')
  if (e.altKey) mods.push('Alt')
  if (e.shiftKey) mods.push('Shift')
  const key = e.key
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return null
  if (mods.length === 0) return null // require >= 1 modifier (FR-021b)
  const norm = key.length === 1 ? key.toUpperCase() : key
  return [...mods, norm].join('+')
}

function Toggle({
  checked,
  onChange,
  title,
  children
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title?: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <label className="toggle" title={title}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span>{children}</span>
    </label>
  )
}

function HotkeyRow({
  action,
  label,
  value,
  onChange
}: {
  action: HotkeyAction
  label: string
  value: string
  onChange: (action: HotkeyAction, accel: string) => void
}): JSX.Element {
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (!capturing) return
    function onKey(e: KeyboardEvent): void {
      e.preventDefault()
      const accel = eventToAccelerator(e)
      if (accel) {
        onChange(action, accel)
        setCapturing(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [capturing, action, onChange])

  return (
    <div className="hotkey-row">
      <span>{label}</span>
      <button
        className="btn small"
        onClick={() => setCapturing((c) => !c)}
        title={
          capturing
            ? 'Press a new key combination to bind this shortcut'
            : `Click to rebind (currently ${value})`
        }
      >
        {capturing ? 'Press keys…' : value}
      </button>
    </div>
  )
}

// ---- color math (hex ⇄ hsl) for the in-app picker ----
interface HSL {
  h: number
  s: number
  l: number
}

function hexToHsl(hex: string): HSL {
  const h2 = (hex || '').replace('#', '')
  const full = h2.length === 3 ? h2.split('').map((c) => c + c).join('') : h2
  const n = parseInt(full || '000000', 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// In-app color picker — renders inside the overlay (no native OS dialog, which would
// open behind this always-on-top window). Expands to HSL sliders + a hex field.
function ColorField({
  label,
  value,
  onChange,
  setModalOpen
}: {
  label: string
  value: string
  onChange: (v: string) => void
  setModalOpen: (open: boolean) => void
}): JSX.Element {
  const [open, setOpen] = useState(false)
  const [hsl, setHsl] = useState<HSL>(() => hexToHsl(value))
  const [hexText, setHexText] = useState(() => value.replace('#', '').toUpperCase())

  useEffect(() => {
    setHexText(value.replace('#', '').toUpperCase())
  }, [value])

  function toggle(): void {
    const next = !open
    if (next) setHsl(hexToHsl(value)) // seed sliders from the current color
    setOpen(next)
    setModalOpen(next) // pin the panel open while adjusting
  }

  function update(part: Partial<HSL>): void {
    const next = { ...hsl, ...part }
    setHsl(next)
    onChange(hslToHex(next.h, next.s, next.l))
  }

  function onHex(v: string): void {
    const cleaned = v.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase()
    setHexText(cleaned)
    if (cleaned.length === 6) {
      const hex = `#${cleaned}`
      setHsl(hexToHsl(hex))
      onChange(hex)
    }
  }

  return (
    <div className={`color-field ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="color-row"
        onClick={toggle}
        title={`${open ? 'Close' : 'Open'} the ${label.toLowerCase()} color picker`}
      >
        <span className="color-swatch" style={{ background: value }} />
        <span className="color-label">{label}</span>
        <span className="color-hex">{value.toUpperCase()}</span>
        <span className={`chevron ${open ? 'open' : ''}`}>▸</span>
      </button>

      {open && (
        <div className="color-picker">
          <input
            type="range"
            className="hue-slider"
            min={0}
            max={360}
            value={hsl.h}
            onChange={(e) => update({ h: Number(e.target.value) })}
            aria-label={`${label} hue`}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={hsl.s}
            style={{
              background: `linear-gradient(to right, hsl(${hsl.h},0%,${hsl.l}%), hsl(${hsl.h},100%,${hsl.l}%))`
            }}
            onChange={(e) => update({ s: Number(e.target.value) })}
            aria-label={`${label} saturation`}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={hsl.l}
            style={{
              background: `linear-gradient(to right, #000, hsl(${hsl.h},${hsl.s}%,50%), #fff)`
            }}
            onChange={(e) => update({ l: Number(e.target.value) })}
            aria-label={`${label} lightness`}
          />
          <div className="hex-row">
            <span className="hex-hash">#</span>
            <input
              type="text"
              className="hex-input"
              value={hexText}
              maxLength={6}
              spellCheck={false}
              onChange={(e) => onHex(e.target.value)}
              aria-label={`${label} hex`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function SettingsPanel({
  hotkeyFailed,
  setHotkeyFailed,
  setModalOpen
}: {
  hotkeyFailed: string[]
  setHotkeyFailed: (f: string[]) => void
  setModalOpen: (open: boolean) => void
}): JSX.Element {
  const appearance = useStore((s) => s.appearance)
  const settings = useStore((s) => s.settings)
  const hotkeys = useStore((s) => s.hotkeys)
  const setAppearance = useStore((s) => s.setAppearance)
  const setSettings = useStore((s) => s.setSettings)
  const setHotkeys = useStore((s) => s.setHotkeys)

  const [fonts, setFonts] = useState<string[]>(COMMON_FONTS)
  const isCustom = appearance.theme === 'custom'
  const currentTheme = resolveTheme(appearance)
  const [category, setCategory] = useState<ThemeCategory | 'Custom'>(
    isCustom ? 'Custom' : (THEMES.find((t) => t.id === appearance.theme)?.category ?? 'Dark')
  )

  useEffect(() => {
    void window.api.listFonts().then((list) => {
      if (list.length) setFonts(['system-ui', ...list])
    })
  }, [])

  function updateCustom(key: 'bg' | 'fg' | 'accent', value: string): void {
    setAppearance({ theme: 'custom', custom: { ...appearance.custom, [key]: value } })
  }

  async function applyHotkeys(next: HotkeyBindings): Promise<void> {
    setHotkeys(next)
    const { failed } = await window.api.registerHotkeys(next)
    setHotkeyFailed(failed)
  }

  function changeHotkey(action: HotkeyAction, accel: string): void {
    void applyHotkeys({ ...hotkeys, [action]: accel })
  }

  function resetHotkeys(): void {
    void applyHotkeys({
      toggle: 'CommandOrControl+Alt+Shift+T',
      start: 'CommandOrControl+Alt+Shift+S',
      stop: 'CommandOrControl+Alt+Shift+E'
    })
  }

  return (
    <div className="settings">
      {hotkeyFailed.length > 0 && (
        <div className="warn">
          Some hotkeys couldn’t be registered (already in use): {hotkeyFailed.join(', ')}. Try
          rebinding them below.
        </div>
      )}

      <div className="setting-group">
        <div className="group-head">
          <label>Theme</label>
          <span className="group-value">{isCustom ? 'Custom' : currentTheme.name}</span>
        </div>

        {/* pick a category, then a theme within it — or go fully custom */}
        <div className="cat-chips">
          {THEME_CATEGORIES.map((c) => (
            <button
              key={c}
              className={`cat-chip ${category === c ? 'sel' : ''}`}
              onClick={() => setCategory(c)}
              title={`Show ${c.toLowerCase()} themes`}
            >
              {c}
            </button>
          ))}
          <button
            className={`cat-chip custom ${category === 'Custom' ? 'sel' : ''}`}
            onClick={() => setCategory('Custom')}
            title="Build your own theme with custom colors"
          >
            ✨ Custom
          </button>
        </div>

        {category === 'Custom' ? (
          <div className="custom-theme">
            <ColorField
              label="Background"
              value={appearance.custom.bg}
              onChange={(v) => updateCustom('bg', v)}
              setModalOpen={setModalOpen}
            />
            <ColorField
              label="Font color"
              value={appearance.custom.fg}
              onChange={(v) => updateCustom('fg', v)}
              setModalOpen={setModalOpen}
            />
            <ColorField
              label="Accent"
              value={appearance.custom.accent}
              onChange={(v) => updateCustom('accent', v)}
              setModalOpen={setModalOpen}
            />
            <div
              className="custom-preview"
              style={{
                background: hexToRgba(appearance.custom.bg, 0.92),
                borderColor: hexToRgba(appearance.custom.accent, 0.3),
                color: appearance.custom.fg
              }}
            >
              <span className="cp-time" style={{ color: appearance.custom.accent }}>
                25:00
              </span>
              <span className="cp-label">Preview</span>
            </div>
          </div>
        ) : (
          <div className="theme-swatches">
            {THEMES.filter((t) => t.category === category).map((t) => (
              <button
                key={t.id}
                className={`swatch ${appearance.theme === t.id ? 'sel' : ''}`}
                title={`Apply the ${t.name} theme`}
                style={{ background: t.bg, borderColor: t.border }}
                onClick={() => setAppearance({ theme: t.id })}
              >
                <span className="swatch-time" style={{ color: t.timer }}>
                  25
                </span>
                <span className="swatch-dot" style={{ background: t.accent }} />
                {appearance.theme === t.id && <span className="swatch-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="setting-group">
        <label>Font</label>
        <select
          value={appearance.fontFamily}
          onChange={(e) => setAppearance({ fontFamily: e.target.value })}
          title="Choose the font used for the timer and labels"
        >
          {fonts.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <div className="group-head">
          <label>Size</label>
          <span className="group-value">{Math.round(appearance.size * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.7}
          max={1.8}
          step={0.1}
          value={appearance.size}
          onChange={(e) => setAppearance({ size: Number(e.target.value) })}
          title={`Scale the overlay size (currently ${Math.round(appearance.size * 100)}%)`}
        />
      </div>

      <div className="setting-group">
        <label>Sound</label>
        <div className="row">
          <Toggle
            checked={settings.muted}
            onChange={(v) => setSettings({ muted: v })}
            title="Silence the alarm that plays when a timer ends"
          >
            Mute
          </Toggle>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            disabled={settings.muted}
            onChange={(e) => setSettings({ volume: Number(e.target.value) })}
            title={
              settings.muted
                ? 'Unmute to adjust the alarm volume'
                : `Alarm volume: ${Math.round(settings.volume * 100)}%`
            }
          />
        </div>
      </div>

      <div className="setting-group">
        <label>General</label>
        <Toggle
          checked={settings.notifications}
          onChange={(v) => setSettings({ notifications: v })}
          title="Show a desktop notification when a timer ends"
        >
          Desktop notifications
        </Toggle>
        <Toggle
          checked={settings.launchAtLogin}
          onChange={(v) => setSettings({ launchAtLogin: v })}
          title="Open the timer automatically when you log in to your computer"
        >
          Launch at login
        </Toggle>
        <Toggle
          checked={settings.showInTaskbar}
          onChange={(v) => setSettings({ showInTaskbar: v })}
          title="Show the app in the taskbar/Dock and allow minimizing it there"
        >
          Show in taskbar / Dock
        </Toggle>
      </div>

      <div className="setting-group">
        <div className="group-head">
          <label>Ending warning</label>
          <span className="group-value">{formatWarn(settings.warningSec)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={300}
          step={15}
          value={settings.warningSec}
          onChange={(e) => setSettings({ warningSec: Number(e.target.value) })}
          title="How long before a timer ends to start the warning glow (drag to 0 to turn it off)"
        />
        <Toggle
          checked={settings.warningSound}
          onChange={(v) => setSettings({ warningSound: v })}
          title="Play a soft chime when the ending warning begins"
        >
          Warning chime
        </Toggle>
      </div>

      <div className="setting-group">
        <div className="group-head">
          <label>Breaks</label>
          <span className="group-value">{settings.breakMinutes} min</span>
        </div>
        <Toggle
          checked={settings.autoStartNext}
          onChange={(v) => setSettings({ autoStartNext: v })}
          title="Automatically start the next task after a break ends"
        >
          Auto-start next task
        </Toggle>
        <div className="row between">
          <span className="row-label">Break length</span>
          <div className="add-dur">
            <input
              className="add-mins"
              type="number"
              min={1}
              max={600}
              value={settings.breakMinutes}
              onChange={(e) =>
                setSettings({
                  breakMinutes: Math.max(1, Math.min(600, Number(e.target.value) || 1))
                })
              }
              aria-label="Break length minutes"
              title="Default break length suggested after each task (in minutes)"
            />
            <span className="add-unit">m</span>
          </div>
        </div>
      </div>

      <div className="setting-group">
        <label>Hotkeys</label>
        <HotkeyRow action="toggle" label="Show / Hide" value={hotkeys.toggle} onChange={changeHotkey} />
        <HotkeyRow action="start" label="Start" value={hotkeys.start} onChange={changeHotkey} />
        <HotkeyRow action="stop" label="Stop (pause/resume)" value={hotkeys.stop} onChange={changeHotkey} />
        <button
          className="btn small"
          onClick={resetHotkeys}
          title="Restore the default hotkey bindings"
        >
          Reset to defaults
        </button>
      </div>

      <div className="setting-group">
        <button
          className="btn danger"
          onClick={() => window.api.quit()}
          title="Quit the app completely (your tasks are saved)"
        >
          Quit app
        </button>
      </div>
    </div>
  )
}
