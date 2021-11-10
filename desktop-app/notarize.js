const { notarize } = require('electron-notarize')
const { build } = require('./package.json')

export default async function run (context) {
  if (context.electronPlatformName !== 'darwin') {
    return
  }

  if (!process.env.CI) {
    console.warn('Skipping notarizing step. Packaging is not running in CI')
    return
  }

  await notarizeMacOS()
}

async function notarizeMacOS (context) {
  if (!('APPLE_ID' in process.env && 'APPLE_ID_PASS' in process.env)) {
    console.warn('Skipping notarizing step. APPLE_ID and APPLE_ID_PASS env variables must be set')
    return
  }

  const appName = context.packager.appInfo.productFilename

  await notarize({
    appBundleId: build.appId,
    appPath: `${context.appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASS
  })
}
