import { api } from '@config';
import { Service } from '@freshgum/typedi';

import { AuroraAPI } from './AuroraAPI';

@Service([])
export class APIManager {
    private client = new AuroraAPI(api.web);

    getLauncherInfo() {
        return this.client.launcherRequest();
    }

    getServers() {
        return this.client.serversRequest();
    }

    getProfile(uuid: string) {
        return this.client.profileRequest({ uuid });
    }

    getUpdates(dir: string) {
        return this.client.updateRequest({ dir });
    }

    verify(stage: number, token?: string) {
        return this.client.verifyRequest({ stage, token });
    }
}
