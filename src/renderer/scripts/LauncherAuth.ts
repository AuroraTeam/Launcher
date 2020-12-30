import { ipcRenderer } from 'electron'

export default class LauncherAuth {
    static async auth(login: string, password: string) {
        return await ipcRenderer.invoke('auth', login, password)
    }
}