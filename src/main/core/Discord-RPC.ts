import { Service } from 'typedi';

import { Client } from "@xhayper/discord-rpc";
import { LogHelper } from 'main/helpers/LogHelper';
import { discord_rpc as config } from '@config';

@Service()
export class Discord {
    private client = new Client({
        clientId: config.appId
    });
    private startTimestamp = new Date();

    async start() {
        this.client.on("ready", () => {
            this.client.user?.setActivity({
                details: config.firstLineText,
                state: config.secondLineText,
                buttons: [{label: config.button.label, url: config.button.url}],
                startTimestamp: this.startTimestamp,
                largeImageKey: config.largeImageKey,
                smallImageKey: config.smallImageKey,
                largeImageText: config.largeImageText,
                smallImageText: config.smallImageText
            });
        });
        this.client.login().catch(console.error);
        LogHelper.info("Discord set status.")
    }
}