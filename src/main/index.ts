import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
const { title } = require('../../config.json')

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow : BrowserWindow | null

function createMainWindow() {
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

  window.webContents.on('did-frame-finish-load', () => {
    if (isDevelopment) {
      window.webContents.openDevTools()
    }
  })

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})

ipcMain.on('window-hide', () => {
  console.log(1)
  mainWindow?.minimize()
})

ipcMain.on('window-close', () => {
  console.log(2)
  mainWindow?.close()
})