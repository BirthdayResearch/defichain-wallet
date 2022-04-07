export default ({ config }) => {
  config.ios = {
    bundleIdentifier: process.env.EXPO_BUNDLE_IDENTIFIER
  }
  return {
    ...config,
  }
};