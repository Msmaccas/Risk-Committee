/**
 * Jest configuration for the RiskCommittee repository.  It uses ts-jest to
 * transpile TypeScript sources on the fly.  The rootDir is set to the
 * repository root to ensure modules resolve correctly across packages.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^../packages/(.*)$': '<rootDir>/packages/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  verbose: false
};
