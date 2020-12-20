import { ipcRenderer } from 'electron'

export default class Game {
    /**
     * Start the game
     * @param csl Print to console wrapper
     */
    static async start(profile: any, csl: (string: string) => void) {
        // Захардкорено на время тестов
        ipcRenderer.send('startGame', {
            clientVersion: profile.version,
            clientDir: profile.clientDir,
            assetsDir: profile.assetsDir,
            username: localStorage.getItem('username'),
            userUUID: localStorage.getItem('userUUID'),
            accessToken: '00000000-0000-0000-0000-000000000000',
            mainClass: profile.mainClass,
            clientArgs: profile.clientArgs,
        } as ClientArgs)

        ipcRenderer.on('textToConsole', (_e, string: string) => {
            csl(string)
        })

        ipcRenderer.once('stopGame', () => {
            ipcRenderer.removeAllListeners('textToConsole')
        })

    }
}

interface ClientArgs {
    clientVersion: string
    clientDir: string
    assetsDir: string
    username: string
    userUUID: string
    accessToken: string
    clientClassPath: string[]
    jvmArgs: string[]
    clientArgs: string[]
    mainClass: string
}