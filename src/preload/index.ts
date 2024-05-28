import { contextBridge } from 'electron';

import LoginScene from './components/LoginScene';
import ServerPanel from './components/ServerPanelScene';
import ServersList from './components/ServersListScene';
import Settings from './components/SettingsScene';
import Window from './components/Window';

// export для типизации
export const API = {
    window: {
        hide: Window.hide,
        close: Window.close,
        openExternal: Window.openExternal,
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
        settings: {
            edit: Settings.edit,
            check: Settings.check,
        },
    },
};

contextBridge.exposeInMainWorld('launcherAPI', API);
