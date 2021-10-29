import path from 'path'
import { app, BrowserWindow, shell, protocol } from 'electron'
import MenuBuilder from './src/menu'

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

let mainWindow: BrowserWindow | null = null

async function installExtensions (): Promise<void> {
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

async function createWindow (): Promise<void> {
  if (isDevelopment) {
    await installExtensions()
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 640,
    minHeight: 480,
    title: app.name,
    movable: true,
    icon: path.join(__dirname, '../../shared/assets/images/icon-512.png')
  })

  await mainWindow.loadURL(`file://${path.resolve(__dirname, '../../public/', 'index.html')}`)

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

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    void shell.openExternal(url)
  })
}

function interceptFiles (): void {
  protocol.interceptFileProtocol('file', (request, callback) => {
    /* all urls start with 'file://' */
    const fileUrl = request.url.substr(7)
    const basePath = path.normalize(`${__dirname}/../../../../webapp`)
    if (this.isDevMode) {
      callback(path.normalize(`${basePath}/build/release/${fileUrl}`))
    } else {
      callback(path.normalize(`${basePath}/${fileUrl}`))
    }
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
    interceptFiles()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        await createWindow()
        interceptFiles()
      }
    })
  })
  .catch(console.log)
