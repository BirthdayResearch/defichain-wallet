module.exports = function (api) {
  api.cache(true)
  const plugins = [
    [
      'module-resolver',
      {
        alias: {
          '@api': './app/api',
          '@assets': './app/assets',
          '@constants': './app/constants',
          '@contexts': './app/contexts',
          '@components': './app/components',
          '@environment': './app/environment',
          '@hooks': './app/hooks',
          '@screens': './app/screens',
          '@store': './app/store',
          '@translations': './app/translations',
          '@tailwind': './app/tailwind'
        }
      }
    ]
  ]

  if (process.env.CYPRESS_E2E) {
    plugins.push('istanbul')
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: plugins
  }
}
