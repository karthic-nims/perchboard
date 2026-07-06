import { contextBridge, ipcRenderer } from 'electron'
import type { Api, AppEvent, HotkeyAction, HotkeyBindings, PersistedState } from './index.d'

const api: Api = {
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (patch: Partial<PersistedState>) => ipcRenderer.invoke('state:save', patch),
  setIgnoreMouse: (ignore: boolean) => ipcRenderer.send('window:setIgnoreMouse', ignore),
  getWindowPosition: () => ipcRenderer.invoke('window:getPosition'),
  setWindowPosition: (x: number, y: number) => ipcRenderer.send('window:setPosition', x, y),
  resizeWindow: (w: number, h: number) => ipcRenderer.send('window:resize', w, h),
  notify: (title: string, body: string) => ipcRenderer.send('notify', title, body),
  listFonts: () => ipcRenderer.invoke('fonts:list'),
  setLaunchAtLogin: (enabled: boolean) => ipcRenderer.send('app:setLaunchAtLogin', enabled),
  registerHotkeys: (bindings: HotkeyBindings) => ipcRenderer.invoke('hotkeys:register', bindings),
  onAppEvent: (cb: (event: AppEvent) => void) => {
    const handler = (_e: unknown, action: HotkeyAction): void => cb(action)
    const settings = (): void => cb('settings')
    ipcRenderer.on('hotkey', handler)
    ipcRenderer.on('open-settings', settings)
    return () => {
      ipcRenderer.removeListener('hotkey', handler)
      ipcRenderer.removeListener('open-settings', settings)
    }
  },
  hide: () => ipcRenderer.send('window:hide'),
  minimize: () => ipcRenderer.send('window:minimize'),
  setTaskbarMode: (enabled: boolean) => ipcRenderer.send('window:setTaskbarMode', enabled),
  quit: () => ipcRenderer.send('app:quit')
}

contextBridge.exposeInMainWorld('api', api)
