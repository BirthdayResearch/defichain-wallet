module.exports = {
  bumpFiles: [
    {
      filename: 'app.json',
      updater: require.resolve('standard-version-expo'),
    },
    {
      filename: 'app.json',
      updater: require.resolve('standard-version-expo/android'),
    },
    {
      filename: 'app.json',
      updater: require.resolve('standard-version-expo/ios'),
    },
    './desktop-app/package.json',
    './desktop-app/package-lock.json',
    './manifest.json'
  ],
};
