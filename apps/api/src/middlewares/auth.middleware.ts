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

  if (!token) {
    throw new UnauthorizedError("Token não fornecido");
  }

  // Valida sessão/token
  const session = await validateSession(token);

  if (!session) {
    throw new UnauthorizedError("Token inválido ou expirado");
  }

  // Adiciona usuário à requisição
  request.user = session;
}

/**
 * Middleware simplificado para uso em rotas
 * Valida o token Bearer e adiciona o usuário à requisição
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
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

  if (!token) {
    throw new UnauthorizedError("Token não fornecido");
  }

  // TODO: Integrar com Better Auth para validar o token
  // Por enquanto, vamos fazer uma validação básica
  // Em produção, isso deve validar o token com o Better Auth

  // Mock: assumir que o token é válido e extrair dados básicos
  // Você deve substituir isso pela validação real do Better Auth
  try {
    // Aqui você deve validar o token com Better Auth
    // const session = await auth.api.getSession({ headers: request.headers });

    // Por enquanto, vamos apenas verificar se o token existe
    if (token) {
      // Mock de dados do usuário - SUBSTITUIR COM BETTER AUTH
      request.user = {
        id: "mock-user-id",
        email: "mock@example.com",
        name: "Mock User",
      };
    }
  } catch (error) {
    throw new UnauthorizedError("Token inválido ou expirado");
  }
}
