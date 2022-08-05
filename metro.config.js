const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  config.resolver.extraNodeModules.stream = require.resolve('stream-browserify')
//   console.log("config.cacheVersion -->  ", config.cacheVersion)

  return config;
})();

// const { getDefaultConfig } = require('expo/metro-config')
// const defaultConfig = getDefaultConfig(__dirname)

// defaultConfig.resolver.extraNodeModules.stream = require.resolve('stream-browserify')

// defaultConfig.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer')
// defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg')
// defaultConfig.resolver.sourceExts.push('svg')

// module.exports = defaultConfig

// module.exports = (async () => {
//     const {
//         resolver: { sourceExts, assetExts,  },
//     } = await getDefaultConfig(__dirname);
//     return {
//         transformer: {
//             babelTransformerPath: require.resolve('react-native-svg-transformer'),
//         },
//         resolver: {
//             assetExts: assetExts.filter((ext) => ext !== 'svg'),
//             sourceExts: [...sourceExts, 'svg'],
//             // stream: require.resolve('stream-browserify')
//             extraNodeModules: {
//                 // ...defaultConfig.resolver.extraNodeModules
//                 stream: require.resolve('stream-browserify'),
//             }
//         },
//     };
// })();

