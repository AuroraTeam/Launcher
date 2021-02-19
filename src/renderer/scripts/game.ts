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
            // userUUID: localStorage.getItem('userUUID'),
            userUUID: '048c78ed56d711eb939096000089a458',
            // accessToken: '00000000-0000-0000-0000-000000000000',
            accessToken: 'efd742718fe8d8142a3cc47ae578b279',
            mainClass: profile.mainClass,
            // mainClass: "net.minecraft.client.main.Main",
            clientArgs: profile.clientArgs,
            jvmArgs: [
                "-Dminecraft.api.auth.host=https://localhost:1370",
                "-Dminecraft.api.account.host=https://localhost:1370",
                "-Dminecraft.api.session.host=https://localhost:1370",
                "-Dminecraft.api.services.host=https://localhost:1370",
            ]
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
    // clientClassPath: string[]
    jvmArgs: string[]
    clientArgs: string[]
    mainClass: string
}