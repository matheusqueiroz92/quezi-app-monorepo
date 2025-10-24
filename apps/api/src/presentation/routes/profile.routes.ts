/**
 * Rotas de Perfis - Camada de Apresentação
 *
 * Registra todas as rotas relacionadas a perfis específicos
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { type FastifyInstance } from "fastify";
import { ProfileController } from "../controllers/profile.controller";

/**
 * Registra todas as rotas de perfis
 */
export async function profileRoutes(app: FastifyInstance): Promise<void> {
  const profileController = new ProfileController();
  await profileController.registerRoutes(app);
}
