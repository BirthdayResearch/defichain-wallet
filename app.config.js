export default ({ config }) => {
  config.extra = {
    mode: process.env.mode,
    appType: process.env.APP_TYPE
  }
  config.ios = {
    ...config.ios,
    bundleIdentifier: process.env.EXPO_BUNDLE_IDENTIFIER,
  };
  config.updates = {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
  };
  config.extra = {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  };
  return {
    ...config,
  };
};
