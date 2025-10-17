/**
 * Configuração do Jest para Next.js 15
 * Documentação oficial: https://nextjs.org/docs/app/building-your-application/testing/jest
 */

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Caminho para o app Next.js (para carregar next.config.ts e .env)
  dir: "./",
});

const config = {
  // Ambiente de teste
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Cobertura de código
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
  ],

  // Padrões de arquivos de teste
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)",
    "**/*.(test|spec).(ts|tsx|js|jsx)",
  ],

  // Module paths (alias)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Ignorar pastas
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Timeout
  testTimeout: 10000,
};

// createJestConfig é exportado dessa forma para garantir que next/jest
// pode carregar a configuração assíncrona do Next.js
module.exports = createJestConfig(config);
