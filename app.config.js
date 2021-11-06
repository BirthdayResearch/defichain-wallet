export default ({ config }) => {
  config.extra = {
    mode: process.env.mode,
    appType: process.env.APP_TYPE
  }
  return {
    ...config,
  };
};