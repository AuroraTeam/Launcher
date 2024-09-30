import * as proto from "@aurora-launcher/proto";
import { createChannel, createClient } from 'nice-grpc';
import { api as apiConfig } from '@config';
import { Service } from '@freshgum/typedi';

@Service([])
export class APIManager {
    private client = createClient(
        proto.AuroraLauncherServiceDefinition,
        createChannel(apiConfig.ws),
    );

    public auth(login: string, password: string) {
        return this.client.auth({login, password});
    }

    public getServers() {
        return this.client.getServers({});
    }

    public getProfile(uuid: string) {
        return this.client.getProfile({uuid});
    }

    public getUpdates(dir: string) {
        return this.client.getUpdates({dir});
    }
}
