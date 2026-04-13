import type { Config } from 'jest'

const config: Config = {
  preset:              'ts-jest',
  testEnvironment:     'node',
  rootDir:             '.',
  testMatch:           ['**/__tests__/**/*.test.ts'],
  clearMocks:          true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/db/index.ts',
  ],
  coverageDirectory:   'coverage',
}

export default config