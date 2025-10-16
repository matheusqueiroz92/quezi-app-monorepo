import { type FastifyInstance } from "fastify";
import { UserController } from "./user.controller";

/**
 * Registra as rotas do módulo Users
 */
export async function userRoutes(app: FastifyInstance): Promise<void> {
  const userController = new UserController();
  await userController.registerRoutes(app);
}
