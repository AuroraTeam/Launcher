import * as proto from "@aurora-launcher/proto";
import { createChannel, createClient, Metadata } from 'nice-grpc';
import { api as apiConfig } from '@config';
import { Service } from '@freshgum/typedi';
import { publicDecrypt, publicEncrypt } from 'crypto';
import { LogHelper } from '../helpers/LogHelper';

@Service([])
export class APIManager {
    private client = createClient(
        proto.AuroraLauncherServiceDefinition,
        createChannel(apiConfig.ws),
    );
    private token = '0';

    public async initConnection() {
        const tokenOrig = (await this.client.getToken({})).token;
        console.log(tokenOrig);
        const { publicKey } = apiConfig;
        if (!publicKey) {
            LogHelper.fatal('Verify public key required');
        }

        try {
            const decryptedToken = publicDecrypt(
                publicKey,
                Buffer.from(tokenOrig, 'hex'),
            );
            this.token = publicEncrypt(publicKey, decryptedToken).toString('hex');
            console.log(this.token);
        }
        catch(error) {
            LogHelper.error(error);
        }
    }

    public auth(login: string, password: string) {
        return this.client.auth({login, password}, {metadata: Metadata({Authorization: this.token})});
    }

    public getServers() {
        return this.client.getServers({}, {metadata: Metadata({Authorization: this.token})});
    }

    public getProfile(uuid: string) {
        return this.client.getProfile({uuid}, {metadata: Metadata({Authorization: this.token})});
    }

    public getUpdates(dir: string) {
        return this.client.getUpdates({dir}, {metadata: Metadata({Authorization: this.token})});
    }
}
