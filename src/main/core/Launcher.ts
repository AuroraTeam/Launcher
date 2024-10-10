import { Service } from '@freshgum/typedi';

import { APIManager } from '../api/APIManager';
import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { LoginScene } from '../scenes/Login';
import { ServerPanelScene } from '../scenes/ServerPanel';
import { ServersListScene } from '../scenes/ServersList';
import { SettingsScene } from '../scenes/Settings';
import { DiscordRPC } from './DiscordRPC';
import { LauncherWindow } from './LauncherWindow';

@Service([
    LauncherWindow,
    APIManager,
    DiscordRPC,
    VerifyService,
    LoginScene,
    ServersListScene,
    ServerPanelScene,
    SettingsScene,
])
export class Launcher {
    constructor(
        private window: LauncherWindow,
        private apiManager: APIManager,
        private discordRPC: DiscordRPC,

        private loginScene: LoginScene,
        private serversListScene: ServersListScene,
        private serverPanelScene: ServerPanelScene,
        private settingsScene: SettingsScene,
    ) {
        this.init();
    }

    async init() {
        StorageHelper.createMissing();

        this.apiManager.initConnection();

        this.loginScene.initHandlers();
        this.settingsScene.initHandlers();
        this.serversListScene.initHandlers();
        this.serverPanelScene.initHandlers();
        this.discordRPC.initHandlers();

        this.window.createWindow();
        LogHelper.info('Launcher started');
        this.discordRPC.start();
    }
}
