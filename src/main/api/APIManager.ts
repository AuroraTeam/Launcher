import * as proto from "@aurora-launcher/proto";
import { createChannel, createClient, Metadata, Status, ClientError } from 'nice-grpc';
import { api as apiConfig } from '@config';
import { Service } from '@freshgum/typedi';
import { publicDecrypt, publicEncrypt } from 'crypto';
import { LogHelper } from '../helpers/LogHelper';

@Service([])
export class APIManager {
    private client = createClient(
        proto.AuroraLauncherServiceDefinition,
        createChannel(apiConfig.grpc),
    );
    private token = '0';

    public async initConnection() {
        const tokenOrig = (await this.client.getToken({})).token;
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
        }
        catch(error) {
            LogHelper.error(error);
        }
    }

    public async auth(login: string, password: string) {
        try {
            return await this.client.auth({login, password}, {metadata: Metadata({Authorization: this.token})});
        } catch(error) {
            if (error instanceof ClientError && error.code == Status.UNAUTHENTICATED) {
                await this.initConnection();
                return await this.client.auth({login, password}, {metadata: Metadata({Authorization: this.token})});
            }
            throw error;
        }
    }

    public async getServers() {
        try {
            return await this.client.getServers({}, {metadata: Metadata({Authorization: this.token})});
        } catch(error) {
            if (error instanceof ClientError && error.code == Status.UNAUTHENTICATED) {
                await this.initConnection();
                return await this.client.getServers({}, {metadata: Metadata({Authorization: this.token})});
            }
            throw error;
        }
    }

    public async getProfile(uuid: string) {
        try {
            return await this.client.getProfile({uuid}, {metadata: Metadata({Authorization: this.token})});
        } catch(error) {
            if (error instanceof ClientError && error.code == Status.UNAUTHENTICATED) {
                await this.initConnection();
                return await this.client.getProfile({uuid}, {metadata: Metadata({Authorization: this.token})});
            }
            throw error;
        }
    }

    public async getUpdates(dir: string) {
        try {
            return await this.client.getUpdates({dir}, {metadata: Metadata({Authorization: this.token})});
        } catch(error) {
            if (error instanceof ClientError && error.code == Status.UNAUTHENTICATED) {
                await this.initConnection();
                return await this.client.getUpdates({dir}, {metadata: Metadata({Authorization: this.token})});
            }
            throw error;
        }
    }
}
