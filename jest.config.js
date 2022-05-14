/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/integrationSpecs/**/*.spec.ts",
    "**/*.spec.ts"
  ]
};
