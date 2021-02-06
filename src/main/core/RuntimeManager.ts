import Starter from "../game/Starter"
import LauncherAuth from "../runtime/components/LauncherAuth"
import ServerList from "../runtime/components/ServerList"

export default class RuntimeManager {
    constructor() {
        new LauncherAuth()
        new ServerList()

        new Starter()
    }
}