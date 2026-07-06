import { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut, Notification, nativeImage, screen } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { loadState, saveState } from './store'
import { iconDataUrl } from './icon'
import type { HotkeyAction, HotkeyBindings } from '../preload/index.d'

const WIN_WIDTH = 360
const WIN_HEIGHT = 520

let win: BrowserWindow | null = null
let tray: Tray | null = null
let isQuiting = false

// ---- single-instance lock (NFR-006) ----
if (!app.requestSingleInstanceLock()) {
  app.quit()
}
app.on('second-instance', () => revealWindow())

function defaultPosition(): { x: number; y: number } {
  const { workArea } = screen.getPrimaryDisplay()
  return { x: workArea.x + workArea.width - WIN_WIDTH - 24, y: workArea.y + 48 }
}

// Clamp a saved position back onto a visible display (FR-020).
function clampToVisible(pos: { x: number; y: number }): { x: number; y: number } {
  const displays = screen.getAllDisplays()
  const visible = displays.some((d) => {
    const a = d.workArea
    return pos.x >= a.x - WIN_WIDTH + 80 && pos.x <= a.x + a.width - 80 && pos.y >= a.y && pos.y <= a.y + a.height - 40
  })
  return visible ? pos : defaultPosition()
}

function createWindow(): void {
  const state = loadState()
  const pos = state.windowPosition ? clampToVisible(state.windowPosition) : defaultPosition()

  win = new BrowserWindow({
    width: WIN_WIDTH,
    height: WIN_HEIGHT,
    x: pos.x,
    y: pos.y,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Float above everything, including fullscreen apps / all spaces (FR-002).
  win.setAlwaysOnTop(true, 'screen-saver')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Click-through by default; renderer toggles when over interactive regions (FR-022).
  win.setIgnoreMouseEvents(true, { forward: true })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (rendererUrl) {
    win.loadURL(rendererUrl)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.once('ready-to-show', () => {
    // Show without stealing focus from the active app (NFR-010).
    win?.showInactive()
  })

  win.on('moved', () => {
    if (!win) return
    const [x, y] = win.getPosition()
    saveState({ windowPosition: { x, y } })
  })

  // Close → hide to tray; quit only via tray menu (FR-018).
  win.on('close', (e) => {
    if (!isQuiting) {
      e.preventDefault()
      win?.hide()
    }
  })

  // When minimized to the taskbar/Dock, behave like a normal app (drop float);
  // restore the always-on-top overlay behavior when brought back.
  win.on('minimize', () => win?.setAlwaysOnTop(false))
  win.on('restore', () => win?.setAlwaysOnTop(true, 'screen-saver'))
}

// Toggle between the tray-only overlay and a normal taskbar/Dock app (allows minimize).
function applyTaskbarMode(enabled: boolean): void {
  if (!win) return
  win.setSkipTaskbar(!enabled)
  win.setMinimizable(enabled)
  if (process.platform === 'darwin') {
    if (enabled) void app.dock?.show()
    else app.dock?.hide()
  }
}

function revealWindow(): void {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.showInactive()
}

function toggleWindow(): void {
  if (!win) return
  if (win.isVisible()) win.hide()
  else win.showInactive()
}

function createTray(): void {
  let image = nativeImage.createFromDataURL(iconDataUrl)
  if (process.platform === 'darwin') image.setTemplateImage(true)
  tray = new Tray(image)
  tray.setToolTip('Perchboard')
  const menu = Menu.buildFromTemplate([
    { label: 'Show / Hide', click: () => toggleWindow() },
    {
      label: 'Settings',
      click: () => {
        revealWindow()
        win?.webContents.send('open-settings')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuiting = true
        app.quit()
      }
    }
  ])
  tray.setContextMenu(menu)
  tray.on('click', () => toggleWindow())
}

// ---- global hotkeys (FR-021/021a) ----
function sendHotkey(action: HotkeyAction): void {
  if (action === 'toggle') {
    toggleWindow()
    return
  }
  // start/stop are timer concerns handled in the renderer.
  revealWindow()
  win?.webContents.send('hotkey', action)
}

function registerHotkeys(bindings: HotkeyBindings): { failed: HotkeyAction[] } {
  globalShortcut.unregisterAll()
  const failed: HotkeyAction[] = []
  const entries: [HotkeyAction, string][] = [
    ['toggle', bindings.toggle],
    ['start', bindings.start],
    ['stop', bindings.stop]
  ]
  for (const [action, accel] of entries) {
    if (!accel) {
      continue
    }
    try {
      const ok = globalShortcut.register(accel, () => sendHotkey(action))
      if (!ok || !globalShortcut.isRegistered(accel)) failed.push(action)
    } catch {
      failed.push(action)
    }
  }
  return { failed }
}

// ---- IPC ----
function registerIpc(): void {
  ipcMain.handle('state:load', () => loadState())
  ipcMain.handle('state:save', (_e, patch) => saveState(patch))

  ipcMain.on('window:setIgnoreMouse', (_e, ignore: boolean) => {
    win?.setIgnoreMouseEvents(ignore, { forward: true })
  })
  ipcMain.handle('window:getPosition', () => {
    const [x, y] = win?.getPosition() ?? [0, 0]
    return { x, y }
  })
  ipcMain.on('window:setPosition', (_e, x: number, y: number) => {
    win?.setPosition(Math.round(x), Math.round(y))
  })
  ipcMain.on('window:resize', (_e, w: number, h: number) => {
    win?.setSize(Math.round(w), Math.round(h))
  })
  ipcMain.on('window:hide', () => win?.hide())
  ipcMain.on('window:minimize', () => win?.minimize())
  ipcMain.on('window:setTaskbarMode', (_e, enabled: boolean) => applyTaskbarMode(enabled))
  ipcMain.on('app:quit', () => {
    isQuiting = true
    app.quit()
  })

  ipcMain.on('notify', (_e, title: string, body: string) => {
    if (Notification.isSupported()) new Notification({ title, body }).show()
  })

  ipcMain.on('app:setLaunchAtLogin', (_e, enabled: boolean) => {
    app.setLoginItemSettings({ openAtLogin: enabled })
  })

  ipcMain.handle('hotkeys:register', (_e, bindings: HotkeyBindings) => registerHotkeys(bindings))

  ipcMain.handle('fonts:list', async () => {
    try {
      const fontList = await import('font-list')
      const fonts: string[] = await fontList.getFonts({ disableQuoting: true })
      return Array.from(new Set(fonts)).sort((a, b) => a.localeCompare(b))
    } catch {
      return []
    }
  })
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') app.dock?.hide() // menu-bar only
  registerIpc()
  createWindow()
  createTray()

  const state = loadState()
  registerHotkeys(state.hotkeys)
  if (state.settings.launchAtLogin) {
    app.setLoginItemSettings({ openAtLogin: true })
  }
  if (state.settings.showInTaskbar) applyTaskbarMode(true)

  // Auto-update from GitHub Releases — packaged builds only (no-op in dev).
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {})
  }
})

app.on('window-all-closed', () => {
  // Tray app: do not quit when the window is hidden/closed.
})

app.on('will-quit', () => globalShortcut.unregisterAll())
