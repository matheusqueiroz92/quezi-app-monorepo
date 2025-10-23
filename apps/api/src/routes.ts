import { type FastifyInstance } from "fastify";
import { userRoutes } from "./modules/users";
import { authRoutes } from "./modules/auth/auth.routes";
import { organizationRoutes } from "./modules/organizations";
import {
  offeredServicesRoutes,
  categoriesRoutes,
} from "./modules/offered-services";
import { appointmentsRoutes } from "./modules/appointments";
import { reviewsRoutes } from "./modules/reviews";
import { profilesRoutes } from "./modules/professional-profiles";
import { adminRoutes } from "./modules/admin";
import { companyEmployeeRoutes } from "./modules/company-employees/company-employee.controller";

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
      await apiRoutes.register(appointmentsRoutes, { prefix: "/appointments" });

      // ========================================
      // MÓDULO REVIEWS (AVALIAÇÕES)
      // ========================================
      await apiRoutes.register(reviewsRoutes, { prefix: "/reviews" });

      // ========================================
      // MÓDULO PROFESSIONAL PROFILES (PERFIS)
      // ========================================
      await apiRoutes.register(profilesRoutes, { prefix: "/profiles" });

      // ========================================
      // MÓDULO ADMIN (PAINEL ADMINISTRATIVO)
      // ========================================
      await apiRoutes.register(adminRoutes, { prefix: "/admin" });

      // ========================================
      // MÓDULO COMPANY EMPLOYEES (FUNCIONÁRIOS DA EMPRESA)
      // ========================================
      await apiRoutes.register(companyEmployeeRoutes, { prefix: "/company-employees" });
    },
    { prefix: "/api/v1" }
  );
}
