module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    env: {
      test: {
        plugins: []
      },
      e2e: {
        plugins: ['istanbul']
      }
    }
  }
}
