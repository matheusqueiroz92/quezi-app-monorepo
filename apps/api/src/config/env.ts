import { z } from "zod";

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
  SWAGGER_ENABLED: z
    .string()
    .default("true")
    .transform((val) => val === "true"),

  // Better Auth - Social Providers (opcionais)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Better Auth - URLs
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
});

/**
 * Valida e exporta as variáveis de ambiente
 */
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Erro ao validar variáveis de ambiente:");
  console.error(_env.error.format());
  throw new Error("Configuração de ambiente inválida");
}

export const env = _env.data;
