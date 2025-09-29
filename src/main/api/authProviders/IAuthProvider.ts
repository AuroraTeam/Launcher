export interface IAuthProvider {
    readonly useInjector: boolean;
    readonly injectorEndpoint?: string;

    auth(
        username: string,
        password: string,
        clientToken?: string,
    ): Promise<{
        accessToken: string;
        clientToken: string;
        selectedProfile: {
            id: string;
            name: string;
        };
    }>;

    refresh(
        accessToken: string,
        clientToken?: string,
    ): Promise<{
        accessToken: string;
        clientToken: string;
        selectedProfile: {
            id: string;
            name: string;
        };
    }>;

    verify(accessToken: string, clientToken?: string): Promise<boolean>;

    logout(accessToken: string, clientToken?: string): Promise<void>;
}
