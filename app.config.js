export default ({ config }) => {
  config.extra = {
    mode: process.env.mode
  }
  return {
    ...config,
  };
};