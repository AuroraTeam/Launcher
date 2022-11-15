import { contextBridge, ipcRenderer } from 'electron';

import { API_GET_STATUS_HANDLER } from '../common/channels';
import Game from './components/Game';
import LauncherAuth from './components/LauncherAuth';
import ServerList from './components/ServerList';
import ServerPanel from './components/ServerPanel';
import Window from './components/Window';

// export для типизации
export const API = {
    window: {
        hide: Window.hide,
        close: Window.close,
    },
    game: {
        start: Game.start,
    },
    auth: LauncherAuth.auth,
    api: {
        getStatus: (): Promise<'connected' | 'failure' | 'connecting'> =>
            ipcRenderer.invoke(API_GET_STATUS_HANDLER),
        getServers: ServerList.getServers,
        getProfile: ServerPanel.getProfile,
    },
};

contextBridge.exposeInMainWorld('launcherAPI', API);
