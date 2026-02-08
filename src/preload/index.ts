import { contextBridge } from 'electron';

import LoginScene from './components/LoginScene';
import RPC from './components/RPC';
import ServerPanel from './components/ServerPanelScene';
import ServersList from './components/ServersListScene';
import Settings from './components/SettingsScene';
import Window from './components/Window';

// export для типизации
export const API = {
    window: {
        setTitle: Window.setTitle,
        hide: Window.hide,
        close: Window.close,
        openExternal: Window.openExternal,
        editDir: Window.editDir,
        openDir: Window.openDir,
    },
    rpc: {
        updateActivity: RPC.updateActivity,
        clearActivity: RPC.clearActivity,
    },
    scenes: {
        login: {
            auth: LoginScene.auth,
            initialize: LoginScene.initialize,
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
            setField: Settings.setField,
            getField: Settings.getField,
            getAllFields: Settings.getAllFields,
            getTotalMemory: Settings.getTotalMemory,
        },
    },
};

contextBridge.exposeInMainWorld('launcherAPI', API);
