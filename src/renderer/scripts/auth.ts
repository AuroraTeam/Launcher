import { ipcRenderer } from 'electron'

export default class LauncherAuth {
    static auth(login: string, password: string) {
        // TODO место где можно поразвлекатьяс с валидаторами))
        ipcRenderer.send('auth', login, password)
    }
}