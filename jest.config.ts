import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.ts'],
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/index.ts', 'src/detectors/**/*.ts', 'src/utils/**/*.ts'],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      branches: 80,
    },
  },
  coverageReporters: ['text', 'lcov'],
};

export default config;
