export interface IAuthProvider {
    readonly useInjector: boolean;
    readonly injectorEndpoint?: string;

    login(login: string, password: string): any;
    verify(accessToken: string): any;
    refresh(accessToken: string): any;
    logout(accessToken: string): any;
}
