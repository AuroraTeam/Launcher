import { Profile, Server } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';

import { APIManager } from '../api/APIManager';
import { GameWindow } from './GameWindow';
import { LibrariesMatcher } from './LibrariesMatcher';
import { Starter } from './Starter';
import { Updater } from './Updater';
import { Watcher } from './Watcher';

@Service([APIManager, Updater, Watcher, Starter, GameWindow])
export class GameService {
    private selectedServer?: Server;
    private selectedProfile?: Profile;

    constructor(
        private apiService: APIManager,
        private gameUpdater: Updater,
        private gameWatcher: Watcher,
        private gameStarter: Starter,
        private gameWindow: GameWindow,
    ) {}

    async setServer(server: Server) {
        this.selectedServer = server;
        this.selectedProfile = await this.apiService.getProfile(
            server.profileUUID,
        );
    }

    getServer() {
        return this.selectedServer;
    }

    getProfile() {
        return this.selectedProfile;
    }

    async startGame() {
        const profile = this.selectedProfile;
        const server = this.selectedServer;

        if (!profile || !server) {
            this.gameWindow.sendToConsole('Error: Profile or server not set');
            this.gameWindow.stopGame();
            return;
        }

        const libraries = profile.libraries.filter((library) =>
            LibrariesMatcher.match(library.rules),
        );

        try {
            const gameFiles = await this.gameUpdater.validateClient(
                profile,
                libraries,
            );

            const { nativesFiles } = await this.gameStarter.prestart(profile);

            await this.gameWatcher.start(
                profile,
                libraries,
                nativesFiles,
                gameFiles,
            );

            const { gameProcess } = await this.gameStarter.start(
                profile,
                libraries,
                server,
                this.gameWatcher,
            );

            this.gameWatcher.setGameProcess(gameProcess);
        } catch (error) {
            this.gameWindow.sendToConsole(`${error}`);
            this.gameWindow.stopGame();
            throw error;
        }
    }
}
