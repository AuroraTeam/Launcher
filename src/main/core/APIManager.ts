import { AuroraAPI } from 'aurora-api'

export default class APIManager {
    api: AuroraAPI | null = null

    constructor() {
        this.connect()
    }

    async connect() {
        // TODO Обработка ошибки подключения
        try {
            this.api = await new AuroraAPI().connect('ws://localhost:1370') as AuroraAPI
        } catch (error) {
            console.log(error)
        }
    }
}