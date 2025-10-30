import { type FastifyInstance } from "fastify";
import { userRoutes } from "./presentation/routes/user.routes";
import { registerAuthRoutes } from "./presentation/routes/auth.routes";
import { adminRoutes } from "./presentation/routes/admin.routes";
import { appointmentRoutes } from "./presentation/controllers/appointment.controller";
import { offeredServiceRoutes } from "./presentation/controllers/offered-service.controller";
import { reviewRoutes } from "./presentation/controllers/review.controller";
import { professionalProfileRoutes } from "./presentation/controllers/professional-profile.controller";
import { companyEmployeeRoutes } from "./presentation/controllers/company-employee.controller";

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
      await registerAuthRoutes(apiRoutes);

      // ========================================
      // MÓDULO USERS
      // ========================================
      await apiRoutes.register(userRoutes, { prefix: "/users" });

      // ========================================
      // MÓDULO ADMIN (PAINEL ADMINISTRATIVO)
      // ========================================
      await apiRoutes.register(adminRoutes, { prefix: "/admin" });

      // ========================================
      // OUTROS MÓDULOS - COMENTADOS (erros de compilação)
      // ========================================
      // TODO: Habilitar gradualmente após correção dos erros
      // - Appointments
      // - Offered Services
      // - Reviews
      // - Professional Profiles
      // - Company Employees
    },
    { prefix: "/api/v1" }
  );
}
