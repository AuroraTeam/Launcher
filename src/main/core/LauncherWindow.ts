import { join } from 'path';

import { window as windowConfig } from '@config';
import { window } from '@config';
import { Service } from '@freshgum/typedi';
import {
    BrowserWindow,
    Menu,
    Tray,
    app,
    dialog,
    ipcMain,
    nativeImage,
    shell,
} from 'electron';
import installExtension, {
    REACT_DEVELOPER_TOOLS,
} from 'electron-extension-installer';
import { autoUpdater } from 'electron-updater';

import { EVENTS } from '../../common/channels';
import icon from '../../renderer/runtime/assets/images/icon.png?asset';
import { PlatformHelper } from '../helpers/PlatformHelper';
import { SettingsHelper } from '../helpers/SettingsHelper';

const isDev = process.env.DEV === 'true' && !app.isPackaged;

@Service([])
export class LauncherWindow {
    private mainWindow?: BrowserWindow;

    /**
     * Launcher initialization
     */
    createWindow() {
        autoUpdater.checkForUpdatesAndNotify();
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.whenReady().then(() => {
            this.mainWindow = this.createMainWindow();
            if (isDev) {
                /*@__PURE__*/ installExtension(REACT_DEVELOPER_TOOLS, {
                    loadExtensionOptions: {
                        allowFileAccess: true,
                    },
                })
                    .then((name: any) =>
                        console.log(`Added Extension: ${name}`),
                    )
                    .catch((err: any) =>
                        console.error('An error occurred: ', err),
                    );
            }

            app.on('activate', () => {
                // On macOS it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (!this.mainWindow) this.mainWindow = this.createMainWindow();
            });
        });

        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        app.on('window-all-closed', () => {
            if (!PlatformHelper.isMac) app.quit();
        });

        ipcMain.on(EVENTS.WINDOW.SET_TITLE, (_, title: string) => {
            if (this.mainWindow && title) {
                this.mainWindow.setTitle(title);
            }
        });

        // hide the main window when the minimize button is pressed
        ipcMain.on(EVENTS.WINDOW.HIDE, () => this.mainWindow?.minimize());

        // close the main window when the close button is pressed
        ipcMain.on(EVENTS.WINDOW.CLOSE, () => this.mainWindow?.close());

        ipcMain.on(EVENTS.WINDOW.OPEN_EXTERNAL, (_, url: string) =>
            shell.openExternal(url),
        );

        ipcMain.on(EVENTS.WINDOW.EDIT_DIR, async () => {
            const dirPaths = dialog.showOpenDialogSync({
                title: 'Укажите место хранения игры',
                properties: ['openDirectory'],
            });
            if (
                dirPaths &&
                SettingsHelper.getField('dir') != dirPaths.toString()
            )
                await SettingsHelper.migration(dirPaths.toString());
        });

        ipcMain.on(EVENTS.WINDOW.OPEN_DIR, (_, path: string) =>
            shell.openPath(path),
        );
    }

    /**
     * Create launcher window
     */
    private createMainWindow(): BrowserWindow {
        const iconImage = nativeImage.createFromPath(icon);
        // creating and configuring a tray
        const tray = new Tray(iconImage.resize({ width: 16, height: 16 }));
        tray.setToolTip(`${window.title}`);
        tray.setContextMenu(
            Menu.buildFromTemplate([
                {
                    label: 'Показать окно',
                    click: () => mainWindow.show(),
                },
                {
                    label: 'Закрыть',
                    click: () => mainWindow.close(),
                },
            ]),
        );

        tray.on('click', () => mainWindow.show());

        // creating and configuring a window
        const mainWindow = new BrowserWindow({
            show: false, // Use 'ready-to-show' event to show window
            width: windowConfig.width || 900,
            height: windowConfig.height || 550,
            frame: windowConfig.frame || false,
            resizable: windowConfig.resizable || false,
            maximizable: windowConfig.maximizable || false,
            fullscreenable: windowConfig.fullscreenable || false,
            title: windowConfig.title || 'Aurora Launcher',
            icon: iconImage,
            webPreferences: {
                webSecurity: false, // disable cors check
                preload: join(__dirname, '../preload/index.js'),
                devTools: isDev,
            },
        });

        // https://github.com/electron/electron/issues/1594#issuecomment-419741626
        mainWindow.on('page-title-updated', (evt) => {
            evt.preventDefault();
        });

        mainWindow.webContents.setWindowOpenHandler((data) => {
            shell.openExternal(data.url);
            return { action: 'deny' };
        });

        // loading renderer code (runtime)
        if (isDev && process.env.ELECTRON_RENDERER_URL)
            mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
        else mainWindow.loadFile(join(__dirname, '../renderer/index.html'));

        mainWindow.on('closed', () => {
            this.mainWindow = undefined;
            tray.destroy();
        });

        /**
         * If you install `show: true` then it can cause issues when trying to close the window.
         * Use `show: false` and listener events `ready-to-show` to fix these issues.
         *
         * @see https://github.com/electron/electron/issues/25012
         */
        mainWindow.on('ready-to-show', () => {
            mainWindow?.show();

            // open developer tools when using development mode
            if (isDev) mainWindow.webContents.openDevTools();
        });

        return mainWindow;
    }

    public hideWindow(): void {
        this.mainWindow?.hide();
    }

    public showWindow(): void {
        this.mainWindow?.show();
    }

    public sendEvent(channel: string, ...args: any[]): void {
        this.mainWindow?.webContents.send(channel, ...args);
    }
}
