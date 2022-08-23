import { contextBridge, ipcRenderer } from 'electron';

import Game from './components/Game';
import LauncherAuth from './components/LauncherAuth';
import ServerList from './components/ServerList';
import ServerPanel from './components/ServerPanel';

// export для типизации
export const API = {
    ipc: {
        on: ipcRenderer.on,
        send: ipcRenderer.send,
        invoke: ipcRenderer.invoke,
    },
    game: {
        start: Game.start,
    },
    auth: LauncherAuth.auth,
    api: {
        getStatus: async (): Promise<'connected' | 'failure' | 'connecting'> =>
            await ipcRenderer.invoke('getStatus'),
        getServers: ServerList.getServers,
        getProfile: ServerPanel.getProfile,
    },
};

contextBridge.exposeInMainWorld('launcherAPI', API);
