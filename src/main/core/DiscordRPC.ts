import { discordRPC as config } from '@config'
import { Client } from '@xhayper/discord-rpc'
import { Service } from '@freshgum/typedi'

import { ipcMain } from 'electron'
import { EVENTS } from '../../common/channels'
import { LogHelper } from '../../main/helpers/LogHelper'
import { IHandleable } from './IHandleable'
import { AuthorizationService } from '../api/AuthorizationService';
import { GameService } from '../game/GameService';

@Service([AuthorizationService, GameService])
export class DiscordRPC implements IHandleable{
    constructor(
        private authorizationService: AuthorizationService,
        private gameService: GameService
    ) {}

    private client = new Client({
        clientId: config.appId,
    });
    private startTimestamp = new Date();

    async start() {
        this.client.on('ready', () => {
            this.client.user?.setActivity({
                details: config.default.firstLineText,
                state: config.default.secondLineText,
                buttons:
                    Array.isArray(config.default.buttons) && config.default.buttons.length
                        ? config.default.buttons
                        : undefined,
                startTimestamp: this.startTimestamp,
                largeImageKey: config.default.largeImageKey,
                smallImageKey: config.default.smallImageKey,
                largeImageText: config.default.largeImageText,
                smallImageText: config.default.smallImageText,
            });
        });
        LogHelper.info('Discord set status.');
        this.client.login().catch(console.error);
        // Из-за капризов Discord RPC скорее всего придётся реализовывать gracefull shutdown
        // хотя c nodemon это в любом случае не будет работать
        // process.once('beforeExit', () => this.client.destroy());
        // либо забить как любые другие разрабы, что работают с Discord RPC
    }

    private updateActivity(id: Status) {
        switch(id){
            case "default": {
                this.client.user?.setActivity({
                    details: config.default.firstLineText,
                    state: config.default.secondLineText,
                    buttons:
                        Array.isArray(config.default.buttons) && config.default.buttons.length
                            ? config.default.buttons
                            : undefined,
                    startTimestamp: this.startTimestamp,
                    largeImageKey: config.default.largeImageKey,
                    smallImageKey: config.default.smallImageKey,
                    largeImageText: config.default.largeImageText,
                    smallImageText: config.default.smallImageText,
                });

                LogHelper.dev('Discord status updated to default.');
                break;
            }
            case "profile": {
                this.client.user?.setActivity({
                    details: this.placeholders(config.profile.firstLineText),
                    state: this.placeholders(config.profile.secondLineText),
                    buttons:
                        Array.isArray(config.profile.buttons) && config.profile.buttons.length
                            ? config.profile.buttons
                            : undefined,
                    startTimestamp: this.startTimestamp,
                    largeImageKey: config.profile.largeImageKey,
                    smallImageKey: config.profile.smallImageKey,
                    largeImageText: this.placeholders(config.profile.largeImageText),
                    smallImageText: this.placeholders(config.profile.smallImageText),
                });

                LogHelper.dev('Discord status updated to profile.');
                break;
            }
            case "game": {
                this.client.user?.setActivity({
                    details: this.placeholders(config.game.firstLineText),
                    state: this.placeholders(config.game.secondLineText),
                    buttons:
                        Array.isArray(config.game.buttons) && config.game.buttons.length
                            ? config.game.buttons
                            : undefined,
                    startTimestamp: this.startTimestamp,
                    largeImageKey: config.game.largeImageKey,
                    smallImageKey: config.game.smallImageKey,
                    largeImageText: this.placeholders(config.game.largeImageText),
                    smallImageText: this.placeholders(config.game.smallImageText),
                });

                LogHelper.dev('Discord status updated to game.');
                break;
            }
        }
    }
    
    private clearActivity() {
        this.client.user?.clearActivity()
    }

    private placeholders(text:string) {
        const userArgs = this.authorizationService.getCurrentSession();
        const server = this.gameService.getServer();

        if (!userArgs) throw new Error('Auth requierd');
        if (!server?.serverInfo) throw new Error('No information about the server');
        
        const total = text
            .replace('{nickname}', userArgs.username)
            .replace('{server}', server.serverInfo?.title);
        return total;
    }

    initHandlers() {
        ipcMain.handle(EVENTS.RPC.UPDATE_ACTIVITY, (_, activity) =>
            this.updateActivity(activity)
        );
        //Может не чистить, а ставить стандарт ?
        ipcMain.handle(EVENTS.RPC.CLEAR_ACTIVITY, () =>
            this.clearActivity()
        );
    }
}

export type Status = "default" | "game" | "profile";
