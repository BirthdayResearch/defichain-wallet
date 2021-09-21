const path = require('path')
const { getDefaultConfig } = require('@expo/metro-config')
const defaultConfig = getDefaultConfig(__dirname)

defaultConfig.resolver.extraNodeModules.stream = require.resolve('stream-browserify')

module.exports = {
  ...defaultConfig,
  watchFolders: [path.resolve('../node_modules')]
}
