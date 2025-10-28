import { type FastifyInstance } from "fastify";
import { authRoutes } from "../controllers/auth.controller";

/**
 * Registrar rotas de autenticação
 */
export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  await authRoutes(app);
}
