import { discordRPC as config } from '@config'
import { Client, SetActivity } from '@xhayper/discord-rpc'
import { Service } from 'typedi'

import { ipcMain } from 'electron'
import { EVENTS } from '../../common/channels'
import { LogHelper } from '../../main/helpers/LogHelper'
import { IHandleable } from './IHandleable'

@Service()
export class DiscordRPC implements IHandleable{
    private client = new Client({
        clientId: config.appId,
    });
    private startTimestamp = new Date();

    async start() {
        this.client.on('ready', () => {
            this.client.user?.setActivity({
                details: config.firstLineText,
                state: config.secondLineText,
                buttons:
                    Array.isArray(config.buttons) && config.buttons.length
                        ? config.buttons
                        : undefined,
                startTimestamp: this.startTimestamp,
                largeImageKey: config.largeImageKey,
                smallImageKey: config.smallImageKey,
                largeImageText: config.largeImageText,
                smallImageText: config.smallImageText,
            });
        });
        LogHelper.info('Discord set status.');
        this.client.login().catch(console.error);
        // Из-за капризов Discord RPC скорее всего придётся реализовывать gracefull shutdown
        // хотя c nodemon это в любом случае не будет работать
        // process.once('beforeExit', () => this.client.destroy());
        // либо забить как любые другие разрабы, что работают с Discord RPC
    }

    private updateActivity(updatedActivity: SetActivity) {
        const newActivity = {
            details: updatedActivity.details ?? config.firstLineText,
            state: updatedActivity.state ?? config.secondLineText,
            buttons:
            Array.isArray(config.buttons) && config.buttons.length
                ? config.buttons
                : undefined,
            largeImageKey: updatedActivity.largeImageKey ?? config.largeImageKey,
            smallImageKey: updatedActivity.smallImageKey ?? config.smallImageKey,
            largeImageText: updatedActivity.largeImageText ?? config.largeImageText,
            smallImageText: updatedActivity.smallImageText ?? config.smallImageText,
        };
       
        this.client.user?.setActivity(newActivity);
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
