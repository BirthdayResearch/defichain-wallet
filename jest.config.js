module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: [
    'cypress/.*'
  ],
  setupFiles: [
    './mock.js'
  ],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/.github/**',
    '!**/.husky/**',
    '!**/.idea/**',
    '!**/coverage/**',
    '!**/cypress/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
    '!**/screens/PlaygroundNavigator/**',
    '!**/.versionrc.js',
    '!**/_shim.js',
    '!**/metro.config.js',
    '!**/mock.js'
  ]
}
