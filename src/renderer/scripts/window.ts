import { ipcRenderer } from 'electron'

export default class LauncherWindow {
    static closeWindow() {
        ipcRenderer.send('window-close')
    }

    static hideWindow() {
        ipcRenderer.send('window-hide')
    }
}