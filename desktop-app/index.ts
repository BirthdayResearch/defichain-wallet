import { app, BrowserWindow } from 'electron'
import { setupElectronMenu } from './src/ElectronMenu'
import { setupBrowserWindow } from './src/BrowserWindow'

class MainProcess {
  isDev: boolean = process.env.mode === 'development' || process.env.DEBUG_PROD === 'true'
  browserWindow?: BrowserWindow

  /**
   * Setup App Lifecycle
   */
  async initApp (): Promise<void> {
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

    await app.whenReady()
  }

  /**
   * Setup BrowserWindow Lifecycle
   */
  async initWindow (): Promise<void> {
    const window = await setupBrowserWindow(this.isDev)
    setupElectronMenu()

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
  const main = new MainProcess()
  await main.initApp()
  await main.initWindow()
})()
