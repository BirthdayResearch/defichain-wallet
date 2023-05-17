import path from 'path'
import { app, BrowserWindow } from 'electron'
import MenuBuilder from './src/menu'
import { autoUpdater } from 'electron-updater'

const isDevelopment =
  process.env.mode === 'development' || process.env.DEBUG_PROD === 'true'

let mainWindow: BrowserWindow | null = null
void autoUpdater.checkForUpdatesAndNotify()

async function installExtensions (): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-debug')()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const installer = require('electron-devtools-installer')
  const forceDownload = !(process.env.UPGRADE_EXTENSIONS == null)
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log)
}

function makeSingleInstance (): void {
  if (process.mas) return
  app.requestSingleInstanceLock()
  app.on('second-instance', () => {
    if (mainWindow != null) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })
}

async function createWindow (): Promise<void> {
  if (isDevelopment) {
    await installExtensions()
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: isDevelopment ? 800 : 385,
    height: isDevelopment ? 750 : 720,
    title: app.name,
    movable: true,
    resizable: isDevelopment,
    icon: path.join(__dirname, '../../shared/assets/images/icon-512.png')
  })

  void mainWindow.loadURL(isDevelopment ? 'http://localhost:19006' : `file://${path.resolve(__dirname, '../../web-build/index.html')}`)

  mainWindow.on('ready-to-show', () => {
    if (mainWindow == null) {
      throw new Error('"mainWindow" is not defined')
    }
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(() => {
    return {
      action: 'allow'
    }
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

makeSingleInstance()

app
  .whenReady()
  .then(() => {
    void createWindow()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        void createWindow()
      }
    })
  })
  .catch(console.log)
