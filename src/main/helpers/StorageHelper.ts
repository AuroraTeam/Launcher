import * as fs from "fs"
import * as path from "path"

export class StorageHelper {
    // static storageDir: string = (process.env.DEV || false) ? __dirname : path.resolve(__dirname, '../game') 
    static storageDir: string = __dirname
    static assetsDir: string = path.resolve(StorageHelper.storageDir, "assets")
    static clientsDir: string = path.resolve(StorageHelper.storageDir, "clients")
    static logsDir: string = path.resolve(StorageHelper.storageDir, "logs")
    static tempDir: string = path.resolve(StorageHelper.storageDir, "temp")
    static logFile: string = path.resolve(StorageHelper.logsDir, "Launcher.log")

    static createMissing(): void {
        if (!fs.existsSync(this.assetsDir)) fs.mkdirSync(this.assetsDir)
        if (!fs.existsSync(this.clientsDir)) fs.mkdirSync(this.clientsDir)
        if (!fs.existsSync(this.logsDir)) fs.mkdirSync(this.logsDir)
        if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir)
    }
}
