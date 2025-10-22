import { type FastifyInstance } from "fastify";
import { AdminController } from "./admin.controller";

/**
 * Registra as rotas do módulo Admin
 */
export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const adminController = new AdminController();
  await adminController.registerRoutes(app);
}
