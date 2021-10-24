import LauncherWindow from './LauncherWindow';
import APIManager from './APIManager';
import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import Starter from 'main/game/Starter';

export default class Launcher {
    window = new LauncherWindow();
    api = new APIManager();

    constructor() {
        new Starter();
        StorageHelper.createMissing();
        LogHelper.info('Launcher started');
    }
}
