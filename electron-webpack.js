module.exports = {
  // commonSourceDirectory: './electron/common',
  // staticSourceDirectory: './electron/static',
  main: {
    sourceDirectory: './electron/src'
  },
  renderer: {
    sourceDirectory: './',
    template: '@expo/webpack-config/web-default/index.html',
    webpackConfig: './webpack.electron.config'
  }
}
