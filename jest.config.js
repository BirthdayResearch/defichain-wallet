module.exports = {
  preset: "jest-expo",
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  testPathIgnorePatterns: ["mobile-app/cypress/.*"],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.test.{js,jsx,ts,tsx}",
    "!**/.github/**",
    "!**/.husky/**",
    "!**/.idea/**",
    "!**/coverage/**",
    "!**/cypress/**",
    "!**/node_modules/**",
    "!**/web-build/**",
    "!**/*.config.js",
    "!**/.versionrc.js",
    "!**/_shim.js",
    "!**/screens/PlaygroundNavigator/**",
    "!**/cypress-coverage/**",
    "!**/jest-coverage/**",
  ],
  coverageDirectory: "jest-coverage",
  setupFiles: ["./jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@waveshq/.*)",
  ],
};
