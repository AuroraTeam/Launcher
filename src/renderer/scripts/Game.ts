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
        window.ipcRenderer.send('startGame', {
            ...profile,
            username: localStorage.getItem('username'),
            userUUID: localStorage.getItem('userUUID'),
            accessToken: localStorage.getItem('accessToken'),
        });

        window.ipcRenderer.on('textToConsole', (_e, string: string) => {
            csl(string);
        });

        window.ipcRenderer.on('loadProgress', (_e, data: object) => {
            progress(data);
        });

        window.ipcRenderer.once('stopGame', () => {
            window.ipcRenderer.removeAllListeners('textToConsole');
            callback();
        });
    }
}
