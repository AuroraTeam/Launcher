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
            App.window.sendEvent('apiConnectSuccess')
            // Великие костыли
            setInterval(async () => {
                await this.send('ping')
            }, 10000)
        } catch (error) {
            App.window.sendEvent('apiConnectError', 'Ошибка при подключении')
            console.log(error)
        }
    }

    public async send(type: string, data?: object) {
        return await this.api?.send(type, data)
    }
}