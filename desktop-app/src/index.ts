import { app, BrowserWindow } from 'electron'
import { buildElectronMenu } from './ElectronMenu'
import { setupBrowserWindow } from './BrowserWindow'

class DesktopApp {
  isDev: boolean = process.env.NODE_ENV !== 'production'
  browserWindow?: BrowserWindow

  /**
   * Setup App Lifecycle
   */
  async initApp (): Promise<void> {
    await app.whenReady()
    app.applicationMenu = buildElectronMenu()

    app.on('window-all-closed', () => {
      // OSX Convention: Having the application in memory even after all windows have been closed
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // Best to lock to single instance since multi wallet will be supported within app.
    app.requestSingleInstanceLock()
    app.on('second-instance', () => {
      if (this.browserWindow === undefined) {
        return
      }

      if (this.browserWindow.isMinimized()) {
        this.browserWindow.restore()
      }
      this.browserWindow.focus()
    })

    app.on('activate', () => {
      // OSX Convention: re-create window when dock icon is clicked when no other windows was open.
      if (this.browserWindow === undefined) {
        void this.initWindow()
      }
    })
  }

  /**
   * Setup BrowserWindow Lifecycle
   */
  async initWindow (): Promise<void> {
    const window = await setupBrowserWindow(this.isDev)

    window.on('ready-to-show', () => {
      window.show()
    })

    window.on('closed', () => {
      this.browserWindow = undefined
    })

    this.browserWindow = window
  }
}

void (async function () {
  const app = new DesktopApp()
  await app.initApp()
  await app.initWindow()
})()
