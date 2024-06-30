import { discordRPC as config } from '@config'
import { Client } from '@xhayper/discord-rpc'
import { Service } from '@freshgum/typedi'

import { ipcMain } from 'electron'
import { EVENTS } from '../../common/channels'
import { LogHelper } from '../../main/helpers/LogHelper'
import { IHandleable } from './IHandleable'

@Service([])
export class DiscordRPC implements IHandleable{
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
                const newActivity = {
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
                };
                
                this.client.user?.setActivity(newActivity);
                break;
            }
            case "profile": {
                const newActivity = {
                details: config.profile.firstLineText,
                state: config.profile.secondLineText,
                buttons:
                    Array.isArray(config.profile.buttons) && config.profile.buttons.length
                        ? config.profile.buttons
                        : undefined,
                startTimestamp: this.startTimestamp,
                largeImageKey: config.profile.largeImageKey,
                smallImageKey: config.profile.smallImageKey,
                largeImageText: config.profile.largeImageText,
                smallImageText: config.profile.smallImageText,
                };
                
                this.client.user?.setActivity(newActivity);
                break;
            }
            case "game": {
                const newActivity = {
                details: config.game.firstLineText,
                state: config.game.secondLineText,
                buttons:
                    Array.isArray(config.game.buttons) && config.game.buttons.length
                        ? config.game.buttons
                        : undefined,
                startTimestamp: this.startTimestamp,
                largeImageKey: config.game.largeImageKey,
                smallImageKey: config.game.smallImageKey,
                largeImageText: config.game.largeImageText,
                smallImageText: config.game.smallImageText,
                };
                
                this.client.user?.setActivity(newActivity);
                break;
            }
        }
    }
    
    private clearActivity() {
        this.client.user?.clearActivity()
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
