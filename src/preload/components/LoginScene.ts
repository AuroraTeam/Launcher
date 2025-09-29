import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';
import { Session } from '../../common/types';

export default class LoginScene {
    static auth(login: string, password: string): Promise<Session> {
        return ipcRenderer.invoke(EVENTS.SCENES.LOGIN.AUTH, login, password);
    }

    static authToken(): Promise<Session> {
        return ipcRenderer.invoke(EVENTS.SCENES.LOGIN.AUTH_TOKEN);
    }
}
