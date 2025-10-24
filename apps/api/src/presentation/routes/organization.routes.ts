import { type FastifyInstance } from "fastify";
import { OrganizationController } from "../controllers/organization.controller";

/**
 * Registra as rotas do módulo Organizations
 */
export async function organizationRoutes(app: FastifyInstance): Promise<void> {
  const organizationController = new OrganizationController();
  await organizationController.registerRoutes(app);
}
