/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@repo/utils$": "<rootDir>/../../packages/utils/src/index.ts",
    "^@repo/constants$": "<rootDir>/../../packages/constants/src/index.ts",
    "^@repo/errors$": "<rootDir>/../../packages/errors/src/index.ts",
    "^@repo/types$": "<rootDir>/../../packages/types/src/index.ts",
    "^@repo/api-contracts$": "<rootDir>/../../packages/api-contracts/src/index.ts",
    "^@repo/auth$": "<rootDir>/../../packages/auth/src/index.ts"
  },
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.json"
      }
    ]
  }
};
