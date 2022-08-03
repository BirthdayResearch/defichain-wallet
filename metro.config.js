const { getDefaultConfig } = require('expo/metro-config')
const defaultConfig = getDefaultConfig(__dirname)

defaultConfig.resolver.extraNodeModules.stream = require.resolve('stream-browserify')

// module.exports = defaultConfig

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig(__dirname);
    return {
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer'),
        },
        resolver: {
            assetExts: assetExts.filter((ext) => ext !== 'svg'),
            sourceExts: [...sourceExts, 'svg'],
            // stream: require.resolve('stream-browserify')
            extraNodeModules: {
                // ...defaultConfig.resolver.extraNodeModules
                stream: require.resolve('stream-browserify'),
            }
        },
    };
})();
