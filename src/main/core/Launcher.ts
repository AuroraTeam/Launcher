import { LauncherWindow } from './LauncherWindow';
import { APIManager } from './APIManager';
import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { Starter } from 'main/game/Starter';

export class Launcher {
    public static readonly window = new LauncherWindow();
    public static readonly api = new APIManager();
    private static isInitialized = false;

    constructor() {
        if (Launcher.isInitialized) return;
        Starter.setHandler();
        StorageHelper.createMissing();
        LogHelper.info('Launcher started');
        Launcher.isInitialized = true;
    }
}
