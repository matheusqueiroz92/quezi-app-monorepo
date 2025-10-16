import { type FastifyRequest, type FastifyReply } from "fastify";
import { UnauthorizedError } from "../utils/app-error";

/**
 * Middleware de Autenticação
 *
 * Verifica se usuário está autenticado via token/sessão
 */

/**
 * Tipo para requisição com usuário autenticado
 */
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  }
}

/**
 * Middleware que requer autenticação
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  validateSession: (token: string) => Promise<any>
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Token de autenticação não fornecido");
  }

  // Extrai token do header "Bearer token"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new UnauthorizedError("Formato de token inválido");
  }

  const token = parts[1];

  // Valida sessão/token
  const session = await validateSession(token);

  if (!session) {
    throw new UnauthorizedError("Token inválido ou expirado");
  }

  // Adiciona usuário à requisição
  request.user = session;
}
