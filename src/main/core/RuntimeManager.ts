import Starter from "../game/Starter"
import LauncherAuth from "../components/LauncherAuth"

export default class RuntimeManager {
    constructor() {
        new LauncherAuth()

        new Starter()
    }
}