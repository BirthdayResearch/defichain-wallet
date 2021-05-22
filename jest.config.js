module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: [
    'cypress/.*'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/.github/**',
    '!**/coverage/**',
    '!**/cypress/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.config.js'
  ]
}
