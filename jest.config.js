/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/integrationSpecs/**/*.spec.ts",
    "**/*.spec.ts"
  ]
};
