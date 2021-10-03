export default class LauncherAuth {
    static async auth(login: string, password: string): Promise<any> {
        return await window.launcherAPI.ipc.invoke('auth', login, password);
    }
}
