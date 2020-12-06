import { ipcRenderer } from 'electron'

export default class LauncherAuth {
    static async auth(login: string, password: string) {
        // TODO место где можно поразвлекатья с валидаторами))
        // if (login !== login lol) {}
        // А потом если всё ок отправлять эвент на мейн процесс
        return await ipcRenderer.invoke('auth', login, password)
    }
}