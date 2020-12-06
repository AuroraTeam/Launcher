import { ipcRenderer } from 'electron'

export default class Game {
    /**
     * Start the game
     * @param csl Print to console wrapper
     */
    static async start(csl: (string: string) => void) {
        // Захардкорено на время тестов
        ipcRenderer.send('startGame', {
            clientVersion: '1.16.4',
            clientDir: 'client1.16.4-fabric',
            assetsDir: 'assets1.16.4',
            username: 'JCat',
            userUUID: '00000000-0000-0000-0000-000000000000',
            accessToken: '00000000-0000-0000-0000-000000000000',
            mainClass: 'net.fabricmc.loader.launch.knot.KnotClient',
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