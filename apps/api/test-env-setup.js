// Configuração de variáveis de ambiente para testes específicos
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/quezi_test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.PORT = "3333";
process.env.HOST = "localhost";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.SWAGGER_ENABLED = "true";
process.env.BETTER_AUTH_SECRET = "test-better-auth-secret-key-with-32-chars-minimum";
process.env.BETTER_AUTH_URL = "http://localhost:3333";
