import LauncherWindow from './LauncherWindow';
import APIManager from './APIManager';
import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import Starter from 'main/game/Starter';

export default class Launcher {
    static readonly window = new LauncherWindow();
    static readonly api = new APIManager();

    constructor() {
        Starter.setHandler();
        StorageHelper.createMissing();
        LogHelper.info('Launcher started');
    }
}
