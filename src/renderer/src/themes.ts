// Predefined themes spanning a creative light → dark range (FR-014).
// Each theme also carries a dedicated `timer` color for the big countdown text.
export type ThemeCategory = 'Dark' | 'Light' | 'Nature' | 'Vibrant'

export const THEME_CATEGORIES: ThemeCategory[] = ['Dark', 'Light', 'Nature', 'Vibrant']

export interface Theme {
  id: string
  name: string
  category?: ThemeCategory // omitted for the custom theme
  bg: string // expanded panel background (semi-opaque applied via alpha)
  fg: string // primary text
  muted: string // secondary text
  accent: string // active / highlight
  surface: string // control surfaces
  border: string
  timer: string // the big countdown digits
}

export const THEMES: Theme[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'Dark',
    bg: 'rgba(13, 27, 42, 0.92)',
    fg: '#e0fbfc',
    muted: '#7a99ac',
    accent: '#64ffda',
    surface: 'rgba(100,255,218,0.08)',
    border: 'rgba(100,255,218,0.18)',
    timer: '#64ffda'
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    category: 'Dark',
    bg: 'rgba(0, 0, 0, 0.95)',
    fg: '#fafafa',
    muted: '#737373',
    accent: '#a855f7',
    surface: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.10)',
    timer: '#c084fc'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    category: 'Dark',
    bg: 'rgba(15, 16, 34, 0.93)',
    fg: '#e6e8ff',
    muted: '#7f83b0',
    accent: '#818cf8',
    surface: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.18)',
    timer: '#a5b4fc'
  },
  {
    id: 'paper',
    name: 'Paper',
    category: 'Light',
    bg: 'rgba(250, 250, 249, 0.94)',
    fg: '#1c1917',
    muted: '#78716c',
    accent: '#f97316',
    surface: 'rgba(0,0,0,0.05)',
    border: 'rgba(0,0,0,0.09)',
    timer: '#ea580c'
  },
  {
    id: 'blush',
    name: 'Blush',
    category: 'Light',
    bg: 'rgba(253, 242, 248, 0.94)',
    fg: '#4a2a3a',
    muted: '#b0788f',
    accent: '#ec4899',
    surface: 'rgba(236,72,153,0.07)',
    border: 'rgba(236,72,153,0.16)',
    timer: '#db2777'
  },
  {
    id: 'latte',
    name: 'Latte',
    category: 'Light',
    bg: 'rgba(245, 239, 230, 0.95)',
    fg: '#3b2f2a',
    muted: '#9c8577',
    accent: '#b45309',
    surface: 'rgba(0,0,0,0.05)',
    border: 'rgba(0,0,0,0.09)',
    timer: '#a0522d'
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'Nature',
    bg: 'rgba(15, 33, 27, 0.92)',
    fg: '#e8f3ec',
    muted: '#85a795',
    accent: '#4ade80',
    surface: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.16)',
    timer: '#5eead4'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'Nature',
    bg: 'rgba(12, 30, 44, 0.92)',
    fg: '#dff3f6',
    muted: '#77a0ac',
    accent: '#22d3ee',
    surface: 'rgba(34,211,238,0.08)',
    border: 'rgba(34,211,238,0.18)',
    timer: '#38bdf8'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    category: 'Nature',
    bg: 'rgba(43, 24, 44, 0.92)',
    fg: '#ffe8d6',
    muted: '#c08a86',
    accent: '#ff6b6b',
    surface: 'rgba(255,120,90,0.10)',
    border: 'rgba(255,120,90,0.20)',
    timer: '#ff9e64'
  },
  {
    id: 'neon',
    name: 'Neon Pulse',
    category: 'Vibrant',
    bg: 'rgba(10, 8, 20, 0.94)',
    fg: '#f0e9ff',
    muted: '#8b7fb0',
    accent: '#ff2e97',
    surface: 'rgba(255,46,151,0.10)',
    border: 'rgba(180,120,255,0.24)',
    timer: '#ff4fd8'
  },
  {
    id: 'grape',
    name: 'Grape',
    category: 'Vibrant',
    bg: 'rgba(28, 12, 38, 0.93)',
    fg: '#f3e8ff',
    muted: '#a284c0',
    accent: '#c026d3',
    surface: 'rgba(192,38,211,0.10)',
    border: 'rgba(192,38,211,0.22)',
    timer: '#e879f9'
  }
]

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export interface CustomColors {
  bg: string
  fg: string
  accent: string
}

export const DEFAULT_CUSTOM: CustomColors = { bg: '#1e293b', fg: '#e2e8f0', accent: '#38bdf8' }

/** Convert a #rrggbb (or #rgb) hex string to an rgba() with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = (hex || '').replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full || '000000', 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Build a full Theme from the user's three custom colors, deriving the rest. */
export function buildCustomTheme(c: CustomColors): Theme {
  return {
    id: 'custom',
    name: 'Custom',
    bg: hexToRgba(c.bg, 0.92),
    fg: c.fg,
    muted: hexToRgba(c.fg, 0.55),
    accent: c.accent,
    surface: hexToRgba(c.accent, 0.1),
    border: hexToRgba(c.accent, 0.22),
    timer: c.accent
  }
}

/** Resolve the active Theme from appearance: a predefined id, or the custom colors. */
export function resolveTheme(appearance: { theme: string; custom?: CustomColors }): Theme {
  if (appearance.theme === 'custom') return buildCustomTheme(appearance.custom ?? DEFAULT_CUSTOM)
  return getTheme(appearance.theme)
}
