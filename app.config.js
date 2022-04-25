export default ({ config }) => {
  config.extra = {
    mode: process.env.mode,
    appType: process.env.APP_TYPE
  }
  config.ios = {
    ...config.ios,
    bundleIdentifier: process.env.EXPO_BUNDLE_IDENTIFIER
  }
  return {
    ...config,
  };
};