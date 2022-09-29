// TODO(thedoublejay) - Remove when migration process has been completed
export default ({ config }) => {
  config.ios = {
    ...config.ios,
    bundleIdentifier: process.env.EXPO_BUNDLE_IDENTIFIER,
  };
  config.updates = {
    url: `https://u.expo.dev/${process.env.easProjectId}`,
    fallbackToCacheTimeout: 0,
  };
  config.extra = {
    eas: {
      projectId: process.env.easProjectId,
    },
  };
  console.log(config);
  return {
    ...config,
  };
};
