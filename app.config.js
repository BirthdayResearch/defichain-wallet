// TODO(thedoublejay) - Remove when migration process has been completed
export default ({ config }) => {
  config.ios = {
    ...config.ios,
    bundleIdentifier: process.env.EXPO_BUNDLE_IDENTIFIER,
  };
  config.updates = {
    url: process.env.EAS_PROJECT_UPDATES,
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
