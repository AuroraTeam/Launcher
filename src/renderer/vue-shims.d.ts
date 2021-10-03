declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
declare interface Window {
    launcherAPI: {
        ipc: {
            on(
                channel: string,
                listener: (
                    event: Electron.IpcRendererEvent,
                    ...args: any[]
                ) => void
            ): void;
            send(channel: string, ...args: any[]): void;
            invoke(channel: string, ...args: any[]): Promise<any>;
        };
    };
}
