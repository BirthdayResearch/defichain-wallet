module.exports = function (api) {
  api.cache(true)
  const plugins = [
    [
      'module-resolver',
      {
        alias: {
          '@api': './mobile-app/app/api',
          '@assets': './shared/assets',
          '@constants': './shared/constants',
          '@contexts': './mobile-app/app/contexts',
          '@components': './mobile-app/app/components',
          '@environment': './shared/environment',
          '@hooks': './mobile-app/app/hooks',
          '@screens': './mobile-app/app/screens',
          '@store': './shared/store',
          '@translations': './shared/translations',
          '@tailwind': './mobile-app/app/tailwind'
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
