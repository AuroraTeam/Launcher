import Starter from "../game/Starter"
import LauncherAuth from "../runtime/components/LauncherAuth"
import ServerList from "../runtime/components/ServerList"
import ServerPanel from "../runtime/components/ServerPanel"

export default class RuntimeManager {
    constructor() {
        new LauncherAuth()
        new ServerList()
        new ServerPanel()

        new Starter()
    }
}