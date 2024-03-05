import { discordRPC as config } from '@config';
import { Client } from '@xhayper/discord-rpc';
import { LogHelper } from 'main/helpers/LogHelper';
import { Service } from 'typedi';

@Service()
export class DiscordRPC {
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
    }
}
