import Starter from "../game/Starter"
import LauncherAuth from "../components/LauncherAuth"
import ServerList from "../components/ServerList"

export default class RuntimeManager {
    constructor() {
        new LauncherAuth()
        new ServerList()

        new Starter()
    }
}