// TODO(thedoublejay) - Remove when migration process has been completed
export default ({ config }) => {
  config.ios = {
    ...config.ios,
    bundleIdentifier: process.env.EXPO_BUNDLE_IDENTIFIER,
  };
  config.updates = {
    ...config.updates,
    url: process.env.EAS_UPDATE_URL,
  };
  config.extra.eas = process.env.EAS_PROJECT_ID;
  return {
    ...config,
  };
};
