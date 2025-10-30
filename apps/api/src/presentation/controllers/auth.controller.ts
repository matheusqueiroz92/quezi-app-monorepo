import { type FastifyInstance } from "fastify";
import { auth } from "../../lib/auth";
import { AuthService } from "../../application/services/auth.service";
// Schemas Zod removidos - usando JSON Schema diretamente no Fastify

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
  const authService = new AuthService();

  // Configuração do Better Auth seguindo a documentação oficial
  // Usa o método createAuthHandler para integração com Fastify
  const authHandler = auth.handler;

  // Registra o handler do Better Auth para todas as rotas de autenticação
  app.all("/*", async (request, reply) => {
    try {
      console.log("🔐 Better Auth Request:", {
        method: request.method,
        url: request.url,
      });

      // Constrói a URL completa para o Better Auth (configuração original)
      const fullUrl = `http://localhost:3333${request.url}`;

      console.log("🔍 URL construída:", fullUrl);

      // Converte headers do Fastify para Headers do Web API
      const webHeaders = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value) {
          webHeaders.set(
            key,
            Array.isArray(value) ? value.join(", ") : String(value)
          );
        }
      }

      // Cria a requisição para o Better Auth
      const webRequest = new Request(fullUrl, {
        method: request.method,
        headers: webHeaders,
        body:
          request.method !== "GET" && request.method !== "HEAD"
            ? JSON.stringify(request.body)
            : undefined,
      });

      // Chama o handler do Better Auth
      const response = await authHandler(webRequest);

      // Lê o body da resposta
      const responseBody = await response.text();

      console.log("✅ Better Auth Response:", {
        status: response.status,
        hasBody: !!responseBody,
        contentType: response.headers.get("content-type"),
      });

      // Configura o status da resposta
      reply.status(response.status);

      // Copia todos os headers da resposta
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      // Retorna o body da resposta
      if (responseBody) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          try {
            return JSON.parse(responseBody);
          } catch {
            return responseBody;
          }
        }
        return responseBody;
      }

      return reply.send();
    } catch (error) {
      console.error("❌ Erro no Better Auth handler:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Erro interno do servidor de autenticação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  });

  // Endpoint customizado para obter perfil do usuário autenticado
  app.get(
    "/me",
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
      try {
        // Pega sessão do Better Auth
        const session = await auth.api.getSession({
          headers: request.headers as any,
        });

        console.log("🔍 Session check:", {
          session: !!session,
          headers: request.headers,
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            message: "Usuário não autenticado",
          });
        }

        return session.user;
      } catch (error) {
        console.error("❌ Erro na rota /auth/me:", error);
        return reply.status(401).send({
          error: "Internal Server Error",
          message: "Erro interno do servidor",
        });
      }
    }
  );

  // ========================================
  // ROTAS DE RESET DE SENHA
  // ========================================

  // Enviar email de reset de senha
  app.post(
    "/auth/forgot-password",
    {
      schema: {
        tags: ["auth"],
        description: "Enviar email de recuperação de senha",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
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
      const { email } = request.body as { email: string };

      const result = await authService.forgotPassword(email);

      return reply.send(result);
    }
  );

  // Verificar token de reset
  app.get(
    "/auth/verify-reset-token",
    {
      schema: {
        tags: ["auth"],
        description: "Verificar se token de reset é válido",
        querystring: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              valid: { type: "boolean" },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              valid: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { token } = request.query as { token: string };

      const result = await authService.verifyResetToken(token);

      if (result.valid) {
        return reply.send(result);
      } else {
        return reply.status(400).send(result);
      }
    }
  );

  // Resetar senha com token
  app.post(
    "/auth/reset-password",
    {
      schema: {
        tags: ["auth"],
        description: "Resetar senha com token válido",
        body: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: {
              type: "string",
            },
            newPassword: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
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
      const { token, newPassword } = request.body as {
        token: string;
        newPassword: string;
      };

      const result = await authService.resetPassword(token, newPassword);

      return reply.send(result);
    }
  );
}
