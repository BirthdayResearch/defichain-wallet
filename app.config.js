export default ({ config }) => {
  config.extra = {
    nodeEnv: process.env.NODE_ENV
  }
  return {
    ...config,
  };
};