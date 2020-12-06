import LauncherAuth from "./auth"
import LauncherWindow from "./window"
import { AuroraAPI } from 'aurora-api'
import Game from "./game"

class Launcher {
    api: AuroraAPI | null = null
    window: LauncherWindow | null = null

    async init() {
        this.window = new LauncherWindow()
        // TODO Обработка ошибки подключения
        try {
            this.api = await new AuroraAPI().connect('ws://localhost:1370') as AuroraAPI
        } catch (error) {
            console.log(error)
        }
        new LauncherAuth()
        new Game()
    }
}

export const App = new Launcher()
App.init()
