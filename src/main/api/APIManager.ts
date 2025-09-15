import { AuroraAPI } from '@aurora-launcher/api';
import { api } from '@config';
import { Service } from '@freshgum/typedi';

@Service([])
export class APIManager {
    private client = new AuroraAPI(api.web);

    public async getAuthType() {
        const response = await this.client.launcherRequest();
        return response.settings.authType;
    }

    public auth(login: string, password: string) {
        return this.client.authRequest({ login, password });
    }

    public getServers() {
        return this.client.serversRequest();
    }

    public getProfile(uuid: string) {
        return this.client.profileRequest({ uuid });
    }

    public getUpdates(dir: string) {
        return this.client.updateRequest({ dir });
    }

    public verify(stage: number, token?: string) {
        return this.client.verifyRequest({ stage, token });
    }
}
