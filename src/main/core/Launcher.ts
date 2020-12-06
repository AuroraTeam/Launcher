import LauncherWindow from "./LauncherWindow"
import APIManager from "./ApiManager"
import RuntimeManager from "./RuntimeManager"

export default class Launcher {
    window: LauncherWindow | null = null
    api: APIManager | null = null

    async init() {
        this.window = new LauncherWindow()
        this.api = new APIManager()
        new RuntimeManager()
    }
}
