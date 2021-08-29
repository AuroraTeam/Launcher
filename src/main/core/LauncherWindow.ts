import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
const windowConfig = require('../../../config.json').window;

import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';

export default class LauncherWindow {
    mainWindow: BrowserWindow | null = null;

    /**
     * Launcher initialization
     */
    constructor() {
        // quit application when all windows are closed
        app.on('window-all-closed', () => {
            // on macOS it is common for applications to stay open until the user explicitly quits
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            // on macOS it is common to re-create a window even after all windows have been closed
            if (this.mainWindow === null) {
                this.mainWindow = this.createMainWindow();
            }
        });

        // create main window when electron is ready
        app.on('ready', () => {
            this.mainWindow = this.createMainWindow();
            if (process.env.DEV || false) {
                installExtension(VUEJS_DEVTOOLS, {
                    loadExtensionOptions: { allowFileAccess: true }
                })
                    .then((name: any) =>
                        console.log(`Added Extension:  ${name}`)
                    )
                    .catch((err: any) =>
                        console.log('An error occurred: ', err)
                    );
            }
        });

        // hide the main window when the minimize button is pressed
        ipcMain.on('window-hide', () => {
            this.mainWindow?.minimize();
        });

        // close the main window when the close button is pressed
        ipcMain.on('window-close', () => {
            this.mainWindow?.close();
        });
    }

    /**
     * Create launcher window
     */
    createMainWindow() {
        // creating and configuring a window
        const launcherWindow = new BrowserWindow({
            show: false, // Use 'ready-to-show' event to show window
            width: windowConfig.width || 900,
            height: windowConfig.height || 550,
            frame: windowConfig.frame || false,
            resizable: windowConfig.resizable || false,
            maximizable: windowConfig.maximizable || false,
            fullscreenable: windowConfig.fullscreenable || false,
            title: windowConfig.title || 'Aurora Launcher',
            icon: path.join(__dirname, '../renderer/logo.png'),
            webPreferences: {
                nodeIntegration: true,
                // TODO Пофиксить
                // Временный фикс, подробнее:
                // https://github.com/AuroraTeam/Launcher/issues/3
                // https://github.com/electron/electron/issues/28034
                // https://github.com/electron/electron/blob/master/docs/breaking-changes.md#default-changed-contextisolation-defaults-to-true
                contextIsolation: false
            }
        });

        // loading renderer code (runtime)
        if (process.env.DEV || false) {
            launcherWindow.loadURL('http://localhost:8080');
        } else {
            launcherWindow.loadFile(
                path.join(__dirname, '../renderer/index.html')
            );
        }

        launcherWindow.on('closed', () => {
            this.mainWindow = null;
        });

        /**
         * If you install `show: true` then it can cause issues when trying to close the window.
         * Use `show: false` and listener events `ready-to-show` to fix these issues.
         *
         * @see https://github.com/electron/electron/issues/25012
         */
        launcherWindow.on('ready-to-show', () => {
            launcherWindow?.show();

            // open developer tools when using development mode
            if (process.env.DEV || false)
                launcherWindow.webContents.openDevTools();
        });

        // focus on development tools when opening
        launcherWindow.webContents.on('devtools-opened', () => {
            launcherWindow.focus();
            setImmediate(() => {
                launcherWindow.focus();
            });
        });

        return launcherWindow;
    }

    sendEvent(channel: string, ...args: any[]): void {
        return this.mainWindow?.webContents.send(channel, ...args);
    }
}
