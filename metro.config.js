const { getDefaultConfig } = require("expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules.stream =
  require.resolve("stream-browserify");
defaultConfig.transformer.minifierConfig.compress.drop_console = true;
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, "mjs", "cjs"];

module.exports = defaultConfig;
