import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
const windowConfig = require('@config').window

export default class LauncherWindow {
    mainWindow: BrowserWindow | null = null

    /**
     * Launcher initialization
     */
    constructor() {
        // quit application when all windows are closed
        app.on('window-all-closed', () => {
            // on macOS it is common for applications to stay open until the user explicitly quits
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        app.on('activate', () => {
            // on macOS it is common to re-create a window even after all windows have been closed
            if (this.mainWindow === null) {
                this.mainWindow = this.createMainWindow()
            }
        })

        // create main window when electron is ready
        app.on('ready', () => {
            this.mainWindow = this.createMainWindow()
        })

        // hide the main window when the minimize button is pressed
        ipcMain.on('window-hide', () => {
            this.mainWindow?.minimize()
        })

        // close the main window when the close button is pressed
        ipcMain.on('window-close', () => {
            this.mainWindow?.close()
        })
    }

    /**
     * Create launcher window
     */
    createMainWindow() {
        // creating and configuring a window
        const launcherWindow = new BrowserWindow({
            width: windowConfig.width || 900,
            height: windowConfig.height || 550,
            frame: windowConfig.frame || false,
            resizable: windowConfig.resizable || false,
            maximizable: windowConfig.maximizable || false,
            fullscreenable: windowConfig.fullscreenable || false,
            title: windowConfig.title || "Aurora Launcher",
            icon: path.join(__dirname, '../renderer/logo.png'),
            webPreferences: {
                nodeIntegration: true
            }
        })

        // loading renderer code (runtime)
        launcherWindow.loadURL(formatUrl({
            pathname: path.join(__dirname, '..', 'renderer', 'index.html'),
            protocol: 'file',
            slashes: true
        }))

        launcherWindow.on('closed', () => {
            this.mainWindow = null
        })

        // open developer tools when using development mode
        launcherWindow.webContents.on('did-frame-finish-load', () => {
            if (process.env.DEV || false) launcherWindow.webContents.openDevTools()
        })

        // focus on development tools when opening
        launcherWindow.webContents.on('devtools-opened', () => {
            launcherWindow.focus()
            setImmediate(() => {
                launcherWindow.focus()
            })
        })

        return launcherWindow
    }
}