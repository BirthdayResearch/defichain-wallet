// TODO(thedoublejay) - Remove when migration process has been completed
export default ({ config }) => {
  config.ios = {
    ...config.ios,
    bundleIdentifier: "com.defichain.app.dfx"
  }
  return {
    ...config,
  }
};