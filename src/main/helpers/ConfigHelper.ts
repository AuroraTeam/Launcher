export class ConfigHelper {
    static getConfig(): Config {
        return require('../../../config.json');
    }
}

interface Config {
    window: {
        width: number;
        height: number;
        frame: boolean;
        resizable: boolean;
        maximizable: boolean;
        fullscreenable: boolean;
        title: string;
    };
    api: {
        ws: string;
        web: string;
    };
}
