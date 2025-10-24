import { type FastifyInstance } from "fastify";
import { userRoutes } from "./presentation/routes/user.routes";
// import { authRoutes } from "./presentation/routes/auth.routes";
// import { organizationRoutes } from "./presentation/routes/organization.routes";
// import { offeredServicesRoutes } from "./presentation/routes/offered-services.routes";
import { appointmentsRoutes } from "./presentation/routes/appointments.routes";
// import { profilesRoutes } from "./presentation/routes/professional-profiles.routes";
import { profileRoutes } from "./presentation/routes/profile.routes";
// import { adminRoutes } from "./presentation/routes/admin.routes";
import { companyEmployeeRoutes } from "./presentation/routes/company-employee.routes";
import { companyEmployeeAppointmentRoutes } from "./presentation/routes/company-employee-appointment.routes";
import { reviewsRoutes } from "./presentation/routes/reviews.routes";
import { companyEmployeeReviewRoutes } from "./presentation/routes/company-employee-review.routes";

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
      // await apiRoutes.register(authRoutes);

      // ========================================
      // MÓDULO USERS
      // ========================================
      await apiRoutes.register(userRoutes, { prefix: "/users" });

      // ========================================
      // MÓDULO ORGANIZATIONS (RBAC)
      // ========================================
      // await apiRoutes.register(organizationRoutes, {
      //   prefix: "/organizations",
      // });

      // ========================================
      // MÓDULO OFFERED SERVICES
      // ========================================
      // await apiRoutes.register(offeredServicesRoutes, {
      //   prefix: "/offered-services",
      // });

      // ========================================
      // MÓDULO APPOINTMENTS
      // ========================================
      await apiRoutes.register(appointmentsRoutes, { prefix: "/appointments" });

      // ========================================
      // MÓDULO PROFESSIONAL PROFILES (PERFIS)
      // ========================================
      // await apiRoutes.register(profilesRoutes, { prefix: "/profiles" });

      // ========================================
      // MÓDULO PROFILES (PERFIS ESPECÍFICOS)
      // ========================================
      await apiRoutes.register(profileRoutes, { prefix: "/profiles" });

      // ========================================
      // MÓDULO ADMIN (PAINEL ADMINISTRATIVO)
      // ========================================
      // await apiRoutes.register(adminRoutes, { prefix: "/admin" });

      // ========================================
      // MÓDULO COMPANY EMPLOYEES (FUNCIONÁRIOS DA EMPRESA)
      // ========================================
      await apiRoutes.register(companyEmployeeRoutes, {
        prefix: "/company-employees",
      });

      // ========================================
      // MÓDULO COMPANY EMPLOYEE APPOINTMENTS (AGENDAMENTOS COM FUNCIONÁRIOS)
      // ========================================
      await apiRoutes.register(companyEmployeeAppointmentRoutes, {
        prefix: "/company-employee-appointments",
      });

      // ========================================
      // MÓDULO REVIEWS (AVALIAÇÕES DE PROFISSIONAIS)
      // ========================================
      await apiRoutes.register(reviewsRoutes, {
        prefix: "/reviews",
      });

      // ========================================
      // MÓDULO COMPANY EMPLOYEE REVIEWS (AVALIAÇÕES DE FUNCIONÁRIOS)
      // ========================================
      await apiRoutes.register(companyEmployeeReviewRoutes, {
        prefix: "/company-employee-reviews",
      });
    },
    { prefix: "/api/v1" }
  );
}
