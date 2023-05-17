const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const { merge } = require('webpack-merge')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv)
  // Customize the config before returning it.
  const plugins = []
  if (env.config.extra.appType === 'extension') {
    plugins.push(new CopyPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: './shared/assets/images/icon-512.png' }
      ]
    }))
  }
  return merge(config, {
    output: {
      publicPath: './'
    },
    plugins
  })
}
