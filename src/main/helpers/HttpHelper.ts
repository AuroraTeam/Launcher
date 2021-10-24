import { createWriteStream, unlinkSync } from 'fs';
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import { URL } from 'url';

export class HttpHelper {
    /**
     * Скачивание файла
     * @param url - Объект Url, содержащий ссылку на файл
     * @param path - Строка, содержащая путь до сохраняемого файла
     * @returns Promise который вернёт true в случае успешного скачивания
     */
    static downloadFile(url: URL, path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const file = createWriteStream(path);
            file.on('close', () => {
                resolve(true);
            });

            const get = url.protocol === 'https:' ? httpsGet : httpGet;
            get(url, (res) => {
                res.pipe(file);
            }).on('error', (err) => {
                unlinkSync(path);
                reject(err);
            });
        });
    }
}
