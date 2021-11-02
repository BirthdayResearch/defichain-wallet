import path from 'path'
import { app, BrowserWindow, shell } from 'electron'
import MenuBuilder from './src/menu'

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

let mainWindow: BrowserWindow | null = null

async function installExtensions (): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-debug')()
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
    height: 750,
    title: app.name,
    movable: true,
    resizable: isDevelopment,
    icon: path.join(__dirname, '../../shared/assets/images/icon-512.png')
  })

  await mainWindow.loadURL(isDevelopment ? 'http://localhost:19006' : `file://${path.resolve(__dirname, '../../web-build/index.html')}`)

  mainWindow.on('ready-to-show', () => {
    if (mainWindow == null) {
      throw new Error('"mainWindow" is not defined')
    }
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    void shell.openExternal(url)
  })
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app
  .whenReady()
  .then(async () => {
    await createWindow()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        await createWindow()
      }
      makeSingleInstance()
    })
  })
  .catch(console.log)
