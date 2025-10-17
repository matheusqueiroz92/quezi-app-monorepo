import { type FastifyInstance } from "fastify";
import { auth } from "../../lib/auth";

/**
 * Rotas de Autenticação usando Better Auth
 *
 * Better Auth fornece endpoints prontos:
 * - POST /auth/sign-up/email - Registrar com email/senha
 * - POST /auth/sign-in/email - Login com email/senha
 * - POST /auth/sign-out - Logout
 * - GET /auth/session - Obter sessão atual
 * - POST /auth/verify-email - Verificar email
 * - POST /auth/forgot-password - Esqueci senha
 * - POST /auth/reset-password - Resetar senha
 *
 * Social OAuth:
 * - GET /auth/signin/google - Login com Google
 * - GET /auth/signin/github - Login com GitHub
 * - GET /auth/callback/google - Callback Google
 * - GET /auth/callback/github - Callback GitHub
 *
 * Docs: https://www.better-auth.com/docs/introduction
 */
export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Registra todos os handlers do Better Auth
  // Better Auth expõe automaticamente os endpoints acima
  app.all("/auth/*", async (request, reply) => {
    // Converte requisição Fastify para formato do Better Auth
    const response = await auth.handler({
      method: request.method,
      headers: request.headers as any,
      body: request.body as any,
      query: request.query as any,
    } as any);

    // Configura status e headers
    reply.status(response.status);

    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value) {
          reply.header(key, value);
        }
      });
    }

    // Retorna resposta
    return response.body;
  });

  // Endpoint customizado para obter perfil do usuário autenticado
  app.get(
    "/auth/me",
    {
      schema: {
        tags: ["auth"],
        description: "Obter perfil do usuário autenticado",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              name: { type: "string" },
              userType: { type: "string" },
              isEmailVerified: { type: "boolean" },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Pega sessão do Better Auth
      const session = await auth.api.getSession({
        headers: request.headers as any,
      });

      if (!session) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Usuário não autenticado",
        });
      }

      return session.user;
    }
  );
}
