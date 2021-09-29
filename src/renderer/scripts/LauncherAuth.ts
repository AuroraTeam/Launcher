export default class LauncherAuth {
    static async auth(login: string, password: string): Promise<any> {
        return await window.ipcRenderer.invoke('auth', login, password);
    }
}
