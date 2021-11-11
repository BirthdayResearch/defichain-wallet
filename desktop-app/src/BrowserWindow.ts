import { app, BrowserWindow } from 'electron'
import path from 'path'

export async function setupBrowserWindow (isDev: boolean): Promise<BrowserWindow> {
  const window = new BrowserWindow({
    show: true,
    width: isDev ? 800 : 385,
    height: isDev ? 750 : 720,
    title: app.name,
    movable: true,
    resizable: isDev,
    icon: path.join(__dirname, './src/assets/icon-512.png')
  })

  if (isDev) {
    await installDevExtensions()
    await window.loadURL('http://localhost:19006')
    window.webContents.openDevTools({ mode: 'detach' })
  } else {
    // TODO: to push publishing into another PR to implement it together with web-build
    await window.loadFile(path.resolve(__dirname, '../web-build/index.html'))
  }

  return window
}

async function installDevExtensions (): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-debug')()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const installer = require('electron-devtools-installer')
  const forceDownload = !(process.env.UPGRADE_EXTENSIONS == null)
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']

  return installer.default(
    extensions.map((name) => installer[name]),
    forceDownload
  )
}
