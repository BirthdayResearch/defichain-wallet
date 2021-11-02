const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const { merge } = require('webpack-merge')

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv)
  // Customize the config before returning it.
  return merge(config, {
    output: {
      publicPath: './'
    }
  })
}
