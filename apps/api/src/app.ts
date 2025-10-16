import fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { registerRoutes } from "./routes";

/**
 * Cria e configura a instância do Fastify
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger:
      env.NODE_ENV === "development"
        ? {
            level: "debug",
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            },
          }
        : {
            level: "info",
          },
  });

  // ========================================
  // PLUGINS
  // ========================================

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Swagger - Documentação da API
  if (env.SWAGGER_ENABLED) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "Quezi API",
          description:
            "API REST para plataforma de agendamento de serviços profissionais",
          version: "1.0.0",
        },
        servers: [
          {
            url: `http://${env.HOST}:${env.PORT}`,
            description: "Servidor de desenvolvimento",
          },
        ],
        tags: [
          { name: "users", description: "Gerenciamento de usuários" },
          { name: "services", description: "Gerenciamento de serviços" },
          {
            name: "appointments",
            description: "Gerenciamento de agendamentos",
          },
          { name: "reviews", description: "Avaliações de serviços" },
          { name: "health", description: "Health checks" },
        ],
      },
    });

    await app.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
      },
      staticCSP: true,
    });
  }

  // ========================================
  // ERROR HANDLER
  // ========================================
  app.setErrorHandler(errorHandler);

  // ========================================
  // ROUTES
  // ========================================
  await registerRoutes(app);

  // Health check básico
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  return app;
}
