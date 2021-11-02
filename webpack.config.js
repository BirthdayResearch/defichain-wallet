const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const { merge } = require('webpack-merge')

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv)
  // Customize the config before returning it.
  return merge(config, {
    module: {
      rules: [{
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      }]
    },
    output: {
      publicPath: './'
    }
  })
}
