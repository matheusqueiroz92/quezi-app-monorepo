import {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import { UserService } from "./user.service";
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  listUsersQuerySchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserIdParams,
  type ListUsersQuery,
} from "./user.schema";

/**
 * Camada de Controller - Roteamento e Validação
 * Responsável por lidar com requisições HTTP e validações
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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
              userType: { type: "string", enum: ["CLIENT", "PROFESSIONAL"] },
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
        schema: {
          tags: ["users"],
          description: "Lista usuários com paginação e filtros",
          querystring: {
            type: "object",
            properties: {
              page: { type: "number", minimum: 1, default: 1 },
              limit: { type: "number", minimum: 1, maximum: 100, default: 10 },
              userType: { type: "string", enum: ["CLIENT", "PROFESSIONAL"] },
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
        schema: {
          tags: ["users"],
          description: "Busca um usuário por ID",
          params: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
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
        schema: {
          tags: ["users"],
          description: "Atualiza um usuário",
          params: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
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
        schema: {
          tags: ["users"],
          description: "Deleta um usuário",
          params: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
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

    const result = await this.userService.listUsers({
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
}
