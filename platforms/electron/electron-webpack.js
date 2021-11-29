module.exports = {
  // commonSourceDirectory: './common',
  // staticSourceDirectory: './static',
  main: {
    sourceDirectory: './src'
  },
  renderer: {
    sourceDirectory: '../',
    template: '@expo/webpack-config/web-default/index.html',
    webpackConfig: './webpack.config'
  }
}
