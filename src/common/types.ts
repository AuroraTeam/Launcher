export interface Session {
    username: string;
    userUUID: string;
    accessToken: string;
    clientToken: string;
}

export interface LoadProgress {
    total: number;
    loaded: number;
    type: 'count' | 'size';
}

export interface SettingsFormat {
    username: string;
    userUUID: string;
    accessToken: string;
    clientToken: string;
    dir: string;
    startDebug: boolean;
    autoConnect: boolean;
    fullScreen: boolean;
    clients: {
        clientId: string;
        memory: number;
    }[];
}
