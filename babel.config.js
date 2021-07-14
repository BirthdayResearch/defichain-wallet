module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: process.env.CYPRESS_E2E ? ['istanbul'] : []
  }
}
