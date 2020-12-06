import { ipcRenderer } from 'electron'

export default class Game {
    static async start(csl: (string: string) => void) {
        ipcRenderer.send('startGame')

        ipcRenderer.on('textToConsole', (_e, string: string) => {
            csl(string)
        })

        ipcRenderer.once('stopGame', () => {
            ipcRenderer.removeAllListeners('textToConsole')
        })

    }
}