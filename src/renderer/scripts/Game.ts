export default class Game {
    /**
     * Start the game
     * @param csl Print to console wrapper
     */
    static async start(
        profile: object,
        csl: (string: string) => void,
        progress: (data: object) => void,
        callback: () => void
    ): Promise<void> {
        window.launcherAPI.ipc.send('startGame', {
            ...profile,
            username: localStorage.getItem('username'),
            userUUID: localStorage.getItem('userUUID'),
            accessToken: localStorage.getItem('accessToken'),
        });

        window.launcherAPI.ipc.on('textToConsole', (_e, string: string) => {
            csl(string);
        });

        window.launcherAPI.ipc.on('loadProgress', (_e, data: object) => {
            progress(data);
        });

        window.launcherAPI.ipc.once('stopGame', () => {
            window.launcherAPI.ipc.removeAllListeners('textToConsole');
            callback();
        });
    }
}
