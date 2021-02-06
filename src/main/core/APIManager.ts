import { AuroraAPI } from 'aurora-api'
import { App } from '..'
const apiConfig = require('@config').api

export default class APIManager {
    api: AuroraAPI | null = null

    constructor() {
        this.connect()
    }

    async connect() {
        try {
            this.api = await new AuroraAPI().connect(apiConfig.url || 'ws://localhost:1370') as AuroraAPI
            App.window?.mainWindow?.webContents.send('apiConnectSuccess')
        } catch (error) {
            App.window?.mainWindow?.webContents.send('apiConnectError', 'Ошибка при подключении')
            console.log(error)
        }
    }
}