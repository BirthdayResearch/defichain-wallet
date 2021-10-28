import { BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron'

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string
  submenu?: DarwinMenuItemConstructorOptions[] | Menu
}

export default class MenuBuilder {
  mainWindow: BrowserWindow

  constructor (mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  buildMenu (): Menu {
    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate()

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    return menu
  }

  buildDarwinTemplate (): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'About'
    }
    return [subMenuAbout]
  }

  buildDefaultTemplate (): MenuItemConstructorOptions[] {
    return [
      {
        label: 'About'
      }
    ]
  }
}
