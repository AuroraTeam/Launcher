import { contextBridge, ipcRenderer } from 'electron';
import Game from './components/Game';
import LauncherAuth from './components/LauncherAuth';
import ServerList from './components/ServerList';
import ServerPanel from './components/ServerPanel';

// export для типизации
export const api = {
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
        getServers: ServerList.getServers,
        getProfile: ServerPanel.getProfile,
    },
};

contextBridge.exposeInMainWorld('launcherAPI', api);
