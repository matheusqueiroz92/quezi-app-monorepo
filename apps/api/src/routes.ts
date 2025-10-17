import { type FastifyInstance } from "fastify";
import { userRoutes } from "./modules/users";
import { authRoutes } from "./modules/auth/auth.routes";
import { organizationRoutes } from "./modules/organizations";
import {
  offeredServicesRoutes,
  categoriesRoutes,
} from "./modules/offered-services";

/**
 * Registra todas as rotas da aplicação
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Prefixo para a API
  await app.register(
    async (apiRoutes) => {
      // ========================================
      // HEALTH CHECK
      // ========================================
      apiRoutes.get("/test", {
        schema: {
          tags: ["health"],
          description: "Endpoint de teste",
          response: {
            200: {
              type: "object",
              properties: {
                message: { type: "string" },
                timestamp: { type: "string" },
              },
            },
          },
        },
        handler: async () => {
          return {
            message: "Quezi API está funcionando! 🚀",
            timestamp: new Date().toISOString(),
          };
        },
      });

      // ========================================
      // AUTENTICAÇÃO (Better Auth)
      // ========================================
      await apiRoutes.register(authRoutes);

      // ========================================
      // MÓDULO USERS
      // ========================================
      await apiRoutes.register(userRoutes, { prefix: "/users" });

      // ========================================
      // MÓDULO ORGANIZATIONS (RBAC)
      // ========================================
      await apiRoutes.register(organizationRoutes, {
        prefix: "/organizations",
      });

      // ========================================
      // MÓDULO OFFERED SERVICES E CATEGORIAS
      // ========================================
      await apiRoutes.register(offeredServicesRoutes, {
        prefix: "/offered-services",
      });
      await apiRoutes.register(categoriesRoutes, { prefix: "/categories" });

      // ========================================
      // MÓDULO APPOINTMENTS
      // ========================================
      // TODO: Implementar rotas de appointments
      // await apiRoutes.register(appointmentRoutes, { prefix: "/appointments" });
    },
    { prefix: "/api/v1" }
  );
}
