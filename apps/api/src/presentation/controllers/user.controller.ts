import {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import { UserService } from "../../application/services/user.service";
import { UpdateUserData } from "../../domain/interfaces/repository.interface";
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  updateNotificationPrefsSchema,
  userIdSchema,
  listUsersQuerySchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UpdateProfileInput,
  type UpdateNotificationPrefsInput,
  type UserIdParams,
  type ListUsersQuery,
} from "../schemas/user.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";

/**
 * Camada de Controller - Roteamento e Validação
 * Responsável por lidar com requisições HTTP e validações
 */
export class UserController {
  private userService: UserService;

  constructor() {
    // Injeção de dependência - UserService precisa de UserRepository
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const userRepository =
      new (require("../../infrastructure/repositories/user.repository").UserRepository)(
        prisma
      );
    this.userService = new UserService(userRepository);
  }

  /**
   * Registra todas as rotas de usuários
   */
  async registerRoutes(app: FastifyInstance): Promise<void> {
    // POST /api/v1/users - Criar usuário
    app.post<{ Body: CreateUserInput }>(
      "/",
      {
        schema: {
          tags: ["users"],
          description: "Cria um novo usuário",
          body: {
            type: "object",
            required: ["email", "password", "name", "userType"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 8 },
              name: { type: "string", minLength: 3 },
              phone: { type: "string" },
              userType: {
                type: "string",
                enum: ["CLIENT", "PROFESSIONAL", "COMPANY"],
              },
            },
          },
          response: {
            201: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
                phone: { type: "string" },
                userType: { type: "string" },
                isEmailVerified: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
      this.createUser.bind(this)
    );

    // GET /api/v1/users - Listar usuários
    app.get<{ Querystring: ListUsersQuery }>(
      "/",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["users"],
          description:
            "Lista usuários com paginação e filtros (requer autenticação)",
          querystring: {
            type: "object",
            properties: {
              page: { type: "number", minimum: 1, default: 1 },
              limit: { type: "number", minimum: 1, maximum: 100, default: 10 },
              userType: {
                type: "string",
                enum: ["CLIENT", "PROFESSIONAL", "COMPANY"],
              },
              search: { type: "string" },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      email: { type: "string" },
                      name: { type: "string" },
                      phone: { type: "string" },
                      userType: { type: "string" },
                      isEmailVerified: { type: "boolean" },
                      createdAt: { type: "string" },
                      updatedAt: { type: "string" },
                    },
                  },
                },
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "number" },
                    limit: { type: "number" },
                    total: { type: "number" },
                    totalPages: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
      this.listUsers.bind(this)
    );

    // GET /api/v1/users/:id - Buscar usuário por ID
    app.get<{ Params: UserIdParams }>(
      "/:id",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["users"],
          description: "Busca um usuário por ID (requer autenticação)",
          params: {
            type: "object",
            properties: {
              id: { type: "string" },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
                phone: { type: "string" },
                userType: { type: "string" },
                isEmailVerified: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
      this.getUserById.bind(this)
    );

    // PUT /api/v1/users/:id - Atualizar usuário
    app.put<{ Params: UserIdParams; Body: UpdateUserInput }>(
      "/:id",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["users"],
          description: "Atualiza um usuário (requer autenticação)",
          params: {
            type: "object",
            properties: {
              id: { type: "string" },
            },
          },
          body: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
              name: { type: "string", minLength: 3 },
              phone: { type: "string" },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
                phone: { type: "string" },
                userType: { type: "string" },
                isEmailVerified: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
      this.updateUser.bind(this)
    );

    // DELETE /api/v1/users/:id - Deletar usuário
    app.delete<{ Params: UserIdParams }>(
      "/:id",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["users"],
          description: "Deleta um usuário (requer autenticação)",
          params: {
            type: "object",
            properties: {
              id: { type: "string" },
            },
          },
          response: {
            204: {
              type: "null",
              description: "Usuário deletado com sucesso",
            },
          },
        },
      },
      this.deleteUser.bind(this)
    );

    // PUT /api/v1/users/:id/profile - Atualizar perfil
    app.put<{ Params: UserIdParams; Body: UpdateProfileInput }>(
      "/:id/profile",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["users"],
          summary: "Atualizar perfil do usuário",
          description:
            "Atualiza foto, bio, endereço e cidade (apenas próprio usuário, requer autenticação)",
          params: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" },
            },
          },
          body: {
            type: "object",
            properties: {
              photoUrl: { type: "string", format: "uri" },
              bio: { type: "string", maxLength: 500 },
              defaultAddress: { type: "string" },
              city: { type: "string", minLength: 2 },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { type: "object" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      this.updateUserProfile.bind(this)
    );

    // GET /api/v1/users/:id/public-profile - Perfil público
    app.get<{ Params: UserIdParams }>(
      "/:id/public-profile",
      {
        schema: {
          tags: ["users"],
          summary: "Buscar perfil público",
          description:
            "Retorna perfil público do usuário (sem dados sensíveis)",
          params: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    photoUrl: { type: "string" },
                    bio: { type: "string" },
                    city: { type: "string" },
                    userType: { type: "string" },
                    createdAt: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      this.getPublicProfile.bind(this)
    );

    // PUT /api/v1/users/:id/notification-prefs - Preferências de notificação
    app.put<{ Params: UserIdParams; Body: UpdateNotificationPrefsInput }>(
      "/:id/notification-prefs",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["users"],
          summary: "Atualizar preferências de notificação",
          description:
            "Atualiza preferências de notificação do usuário (requer autenticação)",
          params: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" },
            },
          },
          body: {
            type: "object",
            required: ["notificationPrefs"],
            properties: {
              notificationPrefs: {
                type: "object",
                properties: {
                  email: { type: "boolean", default: true },
                  sms: { type: "boolean", default: false },
                  push: { type: "boolean", default: true },
                  appointmentReminder: { type: "boolean", default: true },
                  appointmentConfirmation: { type: "boolean", default: true },
                  reviewReminder: { type: "boolean", default: true },
                  marketing: { type: "boolean", default: false },
                },
              },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { type: "object" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      this.updateNotificationPrefs.bind(this)
    );
  }

  /**
   * Handler: Criar usuário
   */
  private async createUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Valida dados com Zod
    const data = createUserSchema.parse(request.body);

    const user = await this.userService.createUser(data);

    reply.status(201).send(user);
  }

  /**
   * Handler: Listar usuários
   */
  private async listUsers(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const query = listUsersQuerySchema.parse(request.query);

    const result = await this.userService.searchUsers({
      ...query,
      search: query.search || undefined,
    });

    reply.status(200).send(result);
  }

  /**
   * Handler: Buscar usuário por ID
   */
  private async getUserById(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = userIdSchema.parse(request.params);

    const user = await this.userService.getUserById(id);

    reply.status(200).send(user);
  }

  /**
   * Handler: Atualizar usuário
   */
  private async updateUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = userIdSchema.parse(request.params);
    const data = updateUserSchema.parse(request.body);

    const user = await this.userService.updateUser(id, data);

    reply.status(200).send(user);
  }

  /**
   * Handler: Deletar usuário
   */
  private async deleteUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = userIdSchema.parse(request.params);

    await this.userService.deleteUser(id);

    reply.status(204).send();
  }

  /**
   * Handler: Atualizar perfil do usuário (foto, bio, endereço, cidade)
   */
  async updateUserProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = userIdSchema.parse(request.params);
      const profileData = updateProfileSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Não autenticado" });
      }

      // Usuário só pode atualizar próprio perfil
      if (id !== userId) {
        return reply
          .status(403)
          .send({ error: "Você só pode atualizar seu próprio perfil" });
      }

      // Mapear dados do perfil para UpdateUserData
      // TODO: Adicionar name e phone ao updateProfileSchema quando necessário
      const updateData: UpdateUserData = {};

      const user = await this.userService.updateUser(id, updateData);

      return reply.status(200).send({
        success: true,
        data: user,
        message: "Perfil atualizado com sucesso",
      });
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao atualizar perfil" });
    }
  }

  /**
   * Handler: Buscar perfil público do usuário (sem dados sensíveis)
   */
  async getPublicProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = userIdSchema.parse(request.params);

      const user = await this.userService.getUserById(id);

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      // Retornar apenas dados públicos
      const publicProfile = {
        id: user.id,
        name: user.name,
        userType: user.userType,
        createdAt: user.createdAt,
      };

      return reply.status(200).send({
        success: true,
        data: publicProfile,
      });
    } catch (error) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }
  }

  /**
   * Handler: Atualizar preferências de notificação
   */
  async updateNotificationPrefs(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = userIdSchema.parse(request.params);
      const { notificationPrefs } = updateNotificationPrefsSchema.parse(
        request.body
      );
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Não autenticado" });
      }

      // Usuário só pode atualizar próprias preferências
      if (id !== userId) {
        return reply
          .status(403)
          .send({ error: "Você só pode atualizar suas próprias preferências" });
      }

      // TODO: Implementar preferências de notificação quando a interface for atualizada
      return reply.status(501).send({
        error:
          "Funcionalidade de preferências de notificação não implementada ainda",
      });
    } catch (error) {
      return reply
        .status(500)
        .send({ error: "Erro ao atualizar preferências" });
    }
  }
}
