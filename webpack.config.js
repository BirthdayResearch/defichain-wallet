const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const { merge } = require('webpack-merge')

/**
 * Merge expo webpack config with customisation for electron
 */
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv)
  return merge(config, {
    output: {
      publicPath: './'
    }
  })
}
