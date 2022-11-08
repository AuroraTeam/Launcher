import { ipcRenderer } from 'electron';

export default class LauncherAuth {
    static auth(login: string, password: string): Promise<any> {
        return ipcRenderer.invoke('auth', login, password);
    }
}
