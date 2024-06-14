import { Server } from '@aurora-launcher/core';
import { ipcMain } from 'electron';
import { fetchServerInfo } from 'minestat-es';
import { Service } from '@freshgum/typedi';

import { EVENTS } from '../../common/channels';
import { APIManager } from '../api/APIManager';
import { IHandleable } from '../core/IHandleable';
import { GameService } from '../game/GameService';

@Service([APIManager, GameService])
export class ServersListScene implements IHandleable {
    constructor(
        private apiService: APIManager,
        private gameService: GameService,
    ) {}

    initHandlers() {
        ipcMain.handle(EVENTS.SCENES.SERVERS_LIST.GET_SERVERS, () =>
            this.apiService.getServers(),
        );
        ipcMain.handle(
            EVENTS.SCENES.SERVERS_LIST.SELECT_SERVER,
            (_, server: Server) => this.gameService.setServer(server),
        );
        ipcMain.handle(
            EVENTS.SCENES.SERVERS_LIST.PING_SERVER,
            (_, server: Server) => this.pingServer(server),
        );
    }

    async pingServer(server: Server) {
        if ('hostname' in server) {
            return fetchServerInfo({
                hostname: `_minecraft._tcp.${server.hostname}`,
            });
        }
        return fetchServerInfo({ address: server.ip, port: server.port });
    }
}
