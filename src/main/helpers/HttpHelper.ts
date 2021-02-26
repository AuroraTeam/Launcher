import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import { URL } from "url"

export class HttpHelper {
    /**
     * Скачивание файла
     * @param url - Объект Url, содержащий ссылку на файл
     * @param path - Строка, содержащая путь файла для сохранения
     * @returns Promise который вернёт true в случае успешного скачивания
     */
    static downloadFile(url: URL, path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const handler = url.protocol === "https:" ? https : http
            const tempFile = fs.createWriteStream(path)
            tempFile.on("close", () => {
                resolve(true)
            })

            handler
                .get(url, (res) => {
                    res.pipe(tempFile)
                })
                .on("error", (err) => {
                    fs.unlinkSync(path)
                    reject(err)
                })
        })
    }
}
