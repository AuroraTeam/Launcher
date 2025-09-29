import { HttpHelper } from '@aurora-launcher/core';

import { IAuthProvider } from './IAuthProvider';

export class MicrosoftAuthProvider implements IAuthProvider {
    readonly useInjector = false;

    private authorizationEndpoint = 'https://authserver.mojang.com/';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    auth(login: string, password: string) {
        //// TODO
        return Promise.reject('Not implemented');

        // const { id, name, skins, capes } =
        //     await HttpHelper.getResourceFromJson<{
        //         id: string;
        //         name: string;
        //         skins: { url: string; state: string; variant: string }[];
        //         capes: { url: string; state: string }[];
        //     }>('https://api.minecraftservices.com/minecraft/profile', {
        //         Authorization: `Bearer ${accessToken}`,
        //     });

        // const activeSkin = skins.find((skin) => skin.state === 'ACTIVE');
        // const activeCape = capes.find((cape) => cape.state === 'ACTIVE');

        // return {
        //     username: name,
        //     userUUID: id,
        //     skin: activeSkin?.url,
        //     cape: activeCape?.url,
        //     isAlex: activeSkin?.variant !== 'CLASSIC',
        // };
    }

    refresh(accessToken: string, clientToken?: string) {
        return HttpHelper.postJson<{
            accessToken: string;
            clientToken: string;
            selectedProfile: {
                id: string;
                name: string;
            };
        }>(new URL('/refresh', this.authorizationEndpoint), {
            accessToken,
            clientToken,
        });
    }

    verify(accessToken: string, clientToken?: string) {
        return HttpHelper.postJson<boolean>(
            new URL('/validate', this.authorizationEndpoint),
            { accessToken, clientToken },
        );
    }

    logout(accessToken: string, clientToken?: string) {
        return HttpHelper.postJson<void>(
            new URL('/invalidate', this.authorizationEndpoint),
            { accessToken, clientToken },
        );
    }
}
