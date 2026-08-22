module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-|@react-native|@expo|expo(nent)?|@expo/native|@expo/config-plugins|expo-modules-core|react-native|@react-native-community|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|@sentry))',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};