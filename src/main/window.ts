import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
const { title } = require('../../config.json')

export default class LauncherWindow {
    mainWindow: BrowserWindow | null = null

    constructor() {
        this.init()
    }
    
    init() {
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
        
        // create main BrowserWindow when electron is ready
        app.on('ready', () => {
            this.mainWindow = this.createMainWindow()
        })

        ipcMain.on('window-hide', () => {
            this.mainWindow?.minimize()
        })

        ipcMain.on('window-close', () => {
            this.mainWindow?.close()
        })
    }
    
    createMainWindow() {
        const window = new BrowserWindow({
            width: 900,
            height: 550,
            frame: false,
            resizable: false,
            maximizable: false,
            title: title,
            webPreferences: {
                nodeIntegration: true
            }
        })

        window.loadURL(formatUrl({
            pathname: path.join(__dirname, '..', 'renderer', 'index.html'),
            protocol: 'file',
            slashes: true
        }))

        window.on('closed', () => {
            this.mainWindow = null
        })

        window.webContents.on('did-frame-finish-load', () => {
            if (process.env.DEV) {
                window.webContents.openDevTools()
            }
        })

        window.webContents.on('devtools-opened', () => {
            window.focus()
            setImmediate(() => {
                window.focus()
            })
        })

        return window
    }
}