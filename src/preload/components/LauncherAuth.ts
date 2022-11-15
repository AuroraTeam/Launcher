import { ipcRenderer } from 'electron';

import { API_AUTH_HANDLER } from '../../common/channels';

export default class LauncherAuth {
    static auth(login: string, password: string): Promise<any> {
        return ipcRenderer.invoke(API_AUTH_HANDLER, login, password);
    }
}
