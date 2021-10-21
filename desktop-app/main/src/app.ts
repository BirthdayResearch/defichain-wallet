// import { app, BrowserWindow, Menu, protocol } from 'electron'

// export default class App {
//   mainWindow: Electron.BrowserWindow
//   allowQuit: boolean
//   isAppInitialized: boolean
//   isDevMode: boolean

//   constructor () {
//     this.isDevMode = process.env.NODE_ENV === 'development'
//     this.isAppInitialized = false
//   }

//   async run (): Promise<void> {
//     app.on('ready', this.onAppReady)
//     app.on('activate', this.onAppActivate)
//     this.setNodeEvents()
//   }

//   async onAppReady (): Promise<void> {
//     this.initiateInterceptFileProtocol()
//     await this.createWindow()
//     this.createMenu()
//   }

//   initiateInterceptFileProtocol () {
//     protocol.interceptFileProtocol('file', (request, callback) => {
//       /* all urls start with 'file://' */
//       const fileUrl = request.url.substr(7)
//       const basePath = path.normalize(`${__dirname}/../../../../webapp`)
//       if (this.isDevMode) {
//         callback(path.normalize(`${basePath}/build/release/${fileUrl}`))
//       } else {
//         callback(path.normalize(`${basePath}/${fileUrl}`))
//       }
//     })
//   }

//   installDevelopmentTools = async () => {
//     require('electron-debug')()
//     const installer = require('electron-devtools-installer')
//     const forceDownload = !!process.env.UPGRADE_EXTENSIONS
//     const extensions = [
//       'REACT_DEVELOPER_TOOLS',
//       'REDUX_DEVTOOLS',
//       'REACT_PERF'
//     ]

//     return (
//       installer
//         .default(
//           extensions.map((name) => installer[name]),
//           forceDownload
//         )
//         // tslint:disable-next-line:no-console
//         .catch(console.log)
//     )
//   }

//   createWindow = async () => {
//     if (this.isDevMode) {
//       await this.installDevelopmentTools()
//     }
//     this.mainWindow = new BrowserWindow({
//       width: 1024,
//       height: 768,
//       minWidth: 640,
//       minHeight: 480,
//       title: app.name,
//       titleBarStyle: TITLE_BAR_STYLE,
//       backgroundColor: BACKGROUND_COLOR,
//       movable: true,
//       icon: ICON,
//       webPreferences: {
//         nodeIntegration: true,
//         webSecurity: false,
//         contextIsolation: false
//       }
//     })
//     const loadUrl =
//       process.env.ELECTRON_START_URL ||
//       url.format({
//         pathname: './index.html',
//         protocol: 'file:',
//         slashes: true
//       })

//     this.mainWindow.loadURL(loadUrl)

//     if (this.parseOptions.debug) {
//       this.mainWindow.webContents.openDevTools()
//     }

//     this.mainWindow.on(CLOSE, this.onMainWindowClose)
//     ElectronLogger.info(
//       `[Starting Electron App] OS ${osName()} - ${os.release()}`
//     )
//   }

//   // Create menu
//   createMenu (isWalletLoaded?: boolean) {
//     const appMenu = new AppMenu()
//     const template = appMenu.getTemplate(isWalletLoaded)
//     const menu = Menu.buildFromTemplate(template)
//     Menu.setApplicationMenu(menu)
//   }

//   onAppActivate = () => {
//     if (this.mainWindow === null) {
//       this.createWindow()
//     }
//   }
// }
