import { contextBridge } from 'electron';

import LoginScene from './components/LoginScene';
import ServerPanel from './components/ServerPanelScene';
import ServersList from './components/ServersListScene';
import Window from './components/Window';
import RPC from './components/RPC'

// export для типизации
export const API = {
    window: {
        hide: Window.hide,
        close: Window.close,
    },
    rpc: {
        updateActivity: RPC.updateActivity,
        clearActivity: RPC.clearActivity
    },
    scenes: {
        login: {
            auth: LoginScene.auth,
        },
        serversList: {
            getServers: ServersList.getServers,
            selectServer: ServersList.selectServer,
            pingServer: ServersList.pingServer,
        },
        serverPanel: {
            getProfile: ServerPanel.getProfile,
            getServer: ServerPanel.getServer,
            startGame: ServerPanel.startGame,
        },
    },
};

contextBridge.exposeInMainWorld('launcherAPI', API);
