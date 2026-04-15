import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(js|ts)$": "ts-jest",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/db/index.ts"],
  coverageDirectory: "coverage",
};

export default config;
