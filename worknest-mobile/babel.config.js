module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for Reanimated v4+
            'react-native-worklets/plugin',
        ],
    };
};