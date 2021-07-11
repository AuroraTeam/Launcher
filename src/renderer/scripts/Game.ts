import { ipcRenderer } from "electron"

export default class Game {
    /**
     * Start the game
     * @param csl Print to console wrapper
     */
    static async start(
        profile: any,
        csl: (string: string) => void,
        progress: (data: object) => void,
        callback: () => void
    ) {
        ipcRenderer.send("startGame", {
            ...profile,
            username: localStorage.getItem("username"),
            userUUID: localStorage.getItem("userUUID"),
            accessToken: localStorage.getItem("accessToken")
        })

        ipcRenderer.on("textToConsole", (_e, string: string) => {
            csl(string)
        })

        ipcRenderer.on("loadProgress", (_e, data: object) => {
            progress(data)
        })

        ipcRenderer.once("stopGame", () => {
            ipcRenderer.removeAllListeners("textToConsole")
            callback()
        })
    }
}
