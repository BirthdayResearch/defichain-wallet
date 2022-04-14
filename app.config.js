// TODO(thedoublejay) - Remove when migration process has been completed
export default ({ config }) => {
  const bundleIdentifier = process.env.EXPO_BUNDLE_IDENTIFIER !== '' ? process.env.EXPO_BUNDLE_IDENTIFIER : config.ios.bundleIdentifier
  console.log(bundleIdentifier)
  config.ios = {
    ...config.ios,
    bundleIdentifier
  }
  return {
    ...config,
  }
};