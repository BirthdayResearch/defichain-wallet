import { Menu, MenuItemConstructorOptions, shell } from 'electron'

export function setupElectronMenu (): void {
  const menu = Menu.buildFromTemplate([
    helpMenu(),
    aboutMenu()
  ])

  Menu.setApplicationMenu(menu)
}

function helpMenu (): MenuItemConstructorOptions {
  return {
    label: 'Help',
    submenu: [
      {
        label: 'Submit an issue/feature',
        click: async () => {
          await shell.openExternal('https://github.com/DeFiCh/wallet/issues')
        }
      }
    ]
  }
}

function aboutMenu (): MenuItemConstructorOptions {
  return {
    label: 'About',
    submenu: [
      {
        label: 'Visit our site',
        click: async () => {
          await shell.openExternal('https://defichain.com')
        }
      },
      {
        label: 'Apple App Store',
        click: async () => {
          await shell.openExternal('https://apps.apple.com/us/app/defichain-wallet/id1572472820')
        }
      },
      {
        label: 'Google Play Store',
        click: async () => {
          await shell.openExternal('https://play.google.com/store/apps/details?id=com.defichain.app')
        }
      }
    ]
  }
}
