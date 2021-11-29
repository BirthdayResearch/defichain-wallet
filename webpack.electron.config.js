const { withAlias } = require('@expo/webpack-config/addons')
const { createBabelLoaderFromEnvironment } = require('@expo/webpack-config/loaders')
const {
  getAliases,
  getConfig,
  getModuleFileExtensions,
  getPaths
} = require('@expo/webpack-config/env')
const {
  ExpoDefinePlugin,
  ExpoInterpolateHtmlPlugin
} = require('@expo/webpack-config/plugins')
const {
  getPluginsByName,
  getRulesByMatchingFiles
} = require('@expo/webpack-config/utils')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = config => {
  return withExpoWebpack(config)
}

function withExpoWebpack (config) {
  const projectRoot = __dirname

  // Support react-native-web aliases
  config = withAlias(config, getAliases(projectRoot))

  const env = {
    platform: 'electron',
    projectRoot,
    locations: getPaths(projectRoot)
  }
  if (!config.plugins) config.plugins = []
  if (!config.resolve) config.resolve = {}

  env.config = getConfig(env)

  const [plugin] = getPluginsByName(config, 'HtmlWebpackPlugin')

  if (plugin) {
    const { options } = plugin.plugin
    // Replace HTML Webpack Plugin so we can interpolate it
    // @ts-ignore: webpack version mismatch
    config.plugins.splice(plugin.index, 1, new HtmlWebpackPlugin(options))
    config.plugins.splice(
      plugin.index + 1,
      0,
      // Add variables to the `index.html`
      // @ts-ignore
      ExpoInterpolateHtmlPlugin.fromEnv(env, HtmlWebpackPlugin)
    )
  }

  // Add support for expo-constants
  config.plugins.push(ExpoDefinePlugin.fromEnv(env))

  // Support platform extensions
  config.resolve.extensions = getModuleFileExtensions('electron', 'web')
  config.resolve.extensions.push('.node')

  config.entry = './index.js'

  const babelConfig = createBabelLoaderFromEnvironment(env)
  console.log(babelConfig)

  // // Modify externals https://github.com/electron-userland/electron-webpack/issues/81
  const includeFunc = babelConfig.include // as (path: string) => boolean;
  if (config.externals) {
    config.externals = config.externals.map((external) => {
      if (typeof external !== 'function') {
        const relPath = path.join('node_modules', external)
        if (!includeFunc(relPath)) return external
        return null
      }
      return (ctx, req, cb) => {
        const relPath = path.join('node_modules', req)
        return includeFunc(relPath) ? cb() : external(ctx, req, cb)
      }
    }).filter(Boolean)
  }

  // Replace JS babel loaders with Expo loaders that can handle RN libraries
  const rules = getRulesByMatchingFiles(config, [env.locations.appMain])

  for (const filename of Object.keys(rules)) {
    for (const loaderItem of rules[filename]) {
      (config.module || { rules: [] }).rules.splice(loaderItem.index, 0, babelConfig)
      return config
    }
  }

  return config
}
