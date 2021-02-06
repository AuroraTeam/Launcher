import LauncherWindow from "./LauncherWindow"
import APIManager from "./ApiManager"
import RuntimeManager from "./RuntimeManager"
import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"

export default class Launcher {
    window: LauncherWindow
    api: APIManager

    constructor() {
        this.window = new LauncherWindow()
        this.api = new APIManager()
        new RuntimeManager()
        StorageHelper.createMissing()
        LogHelper.info('Launcher started')
    }
}
