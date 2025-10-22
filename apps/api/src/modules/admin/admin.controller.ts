import {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import { AdminService } from "./admin.service";
import {
  adminLoginSchema,
  createAdminSchema,
  updateAdminSchema,
  updateAdminPasswordSchema,
  adminIdSchema,
  listAdminsQuerySchema,
  userIdSchema,
  suspendUserSchema,
  getUsersQuerySchema,
  getAdminActionsQuery,
  type AdminLoginInput,
  type CreateAdminInput,
  type UpdateAdminInput,
  type UpdateAdminPasswordInput,
  type AdminIdParams,
  type ListAdminsQuery,
  type UserIdParams,
  type SuspendUserInput,
  type GetUsersQuery,
  type GetAdminActionsQuery,
} from "./admin.schema";
import { requireAdmin } from "./middlewares/admin-auth.middleware";
import { requireSuperAdmin } from "./middlewares/admin-permission.middleware";
import { UserRepository } from "../users/user.repository";

/**
 * Camada de Controller - Roteamento e Validação
 * Responsável por lidar com requisições HTTP do painel administrativo
 */
export class AdminController {
  private adminService: AdminService;
  private userRepository: UserRepository;

  constructor() {
    this.adminService = new AdminService();
    this.userRepository = new UserRepository();
  }

  /**
   * Registra todas as rotas administrativas
   */
  async registerRoutes(app: FastifyInstance): Promise<void> {
    // ========================================
    // ROTAS DE AUTENTICAÇÃO (sem middleware)
    // ========================================

    // POST /api/v1/admin/auth/login - Login de admin
    app.post<{ Body: AdminLoginInput }>(
      "/auth/login",
      {
        schema: {
          tags: ["admin"],
          summary: "Login de administrador",
          description: "Autentica um administrador e retorna token JWT",
          body: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 8 },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                admin: { type: "object" },
                token: { type: "string" },
              },
            },
          },
        },
      },
      this.login.bind(this)
    );

    // GET /api/v1/admin/auth/session - Buscar sessão atual
    app.get(
      "/auth/session",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Buscar sessão atual",
          description: "Retorna dados do admin autenticado",
        },
      },
      this.getSession.bind(this)
    );

    // ========================================
    // GESTÃO DE ADMINS (requer autenticação)
    // ========================================

    // POST /api/v1/admin/admins - Criar admin (apenas SUPER_ADMIN)
    app.post<{ Body: CreateAdminInput }>(
      "/admins",
      {
        preHandler: [requireAdmin, requireSuperAdmin],
        schema: {
          tags: ["admin"],
          summary: "Criar novo administrador",
          description: "Cria um novo admin (apenas SUPER_ADMIN)",
          body: {
            type: "object",
            required: ["email", "password", "name", "role"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 8 },
              name: { type: "string", minLength: 3 },
              role: {
                type: "string",
                enum: [
                  "SUPER_ADMIN",
                  "ADMIN",
                  "MODERATOR",
                  "SUPPORT",
                  "ANALYST",
                ],
              },
              permissions: { type: "object" },
            },
          },
        },
      },
      this.createAdmin.bind(this)
    );

    // GET /api/v1/admin/admins - Listar admins
    app.get<{ Querystring: ListAdminsQuery }>(
      "/admins",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Listar administradores",
          description: "Lista todos os administradores com paginação",
        },
      },
      this.listAdmins.bind(this)
    );

    // GET /api/v1/admin/admins/:id - Buscar admin por ID
    app.get<{ Params: AdminIdParams }>(
      "/admins/:id",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Buscar administrador",
          description: "Busca um administrador por ID",
        },
      },
      this.getAdmin.bind(this)
    );

    // PUT /api/v1/admin/admins/:id - Atualizar admin (apenas SUPER_ADMIN)
    app.put<{ Params: AdminIdParams; Body: UpdateAdminInput }>(
      "/admins/:id",
      {
        preHandler: [requireAdmin, requireSuperAdmin],
        schema: {
          tags: ["admin"],
          summary: "Atualizar administrador",
          description: "Atualiza um administrador (apenas SUPER_ADMIN)",
        },
      },
      this.updateAdmin.bind(this)
    );

    // DELETE /api/v1/admin/admins/:id - Deletar admin (apenas SUPER_ADMIN)
    app.delete<{ Params: AdminIdParams }>(
      "/admins/:id",
      {
        preHandler: [requireAdmin, requireSuperAdmin],
        schema: {
          tags: ["admin"],
          summary: "Deletar administrador",
          description: "Deleta um administrador (apenas SUPER_ADMIN)",
        },
      },
      this.deleteAdmin.bind(this)
    );

    // PUT /api/v1/admin/admins/:id/password - Trocar senha
    app.put<{ Params: AdminIdParams; Body: UpdateAdminPasswordInput }>(
      "/admins/:id/password",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Trocar senha",
          description: "Troca a senha do administrador",
        },
      },
      this.changePassword.bind(this)
    );

    // ========================================
    // GESTÃO DE USUÁRIOS
    // ========================================

    // GET /api/v1/admin/users - Listar todos os usuários
    app.get<{ Querystring: GetUsersQuery }>(
      "/users",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Listar usuários",
          description: "Lista todos os usuários da plataforma com filtros",
        },
      },
      this.getUsers.bind(this)
    );

    // GET /api/v1/admin/users/:id - Detalhes de usuário
    app.get<{ Params: UserIdParams }>(
      "/users/:id",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Detalhes de usuário",
          description: "Busca detalhes completos de um usuário",
        },
      },
      this.getUserDetails.bind(this)
    );

    // PUT /api/v1/admin/users/:id/suspend - Suspender usuário
    app.put<{ Params: UserIdParams; Body: SuspendUserInput }>(
      "/users/:id/suspend",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Suspender usuário",
          description: "Suspende um usuário da plataforma",
        },
      },
      this.suspendUser.bind(this)
    );

    // PUT /api/v1/admin/users/:id/activate - Ativar usuário
    app.put<{ Params: UserIdParams }>(
      "/users/:id/activate",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Ativar usuário",
          description: "Remove suspensão de um usuário",
        },
      },
      this.activateUser.bind(this)
    );

    // DELETE /api/v1/admin/users/:id - Deletar usuário permanentemente
    app.delete<{ Params: UserIdParams }>(
      "/users/:id",
      {
        preHandler: [requireAdmin, requireSuperAdmin],
        schema: {
          tags: ["admin"],
          summary: "Deletar usuário",
          description: "Deleta um usuário permanentemente (apenas SUPER_ADMIN)",
        },
      },
      this.deleteUser.bind(this)
    );

    // ========================================
    // ANALYTICS
    // ========================================

    // GET /api/v1/admin/dashboard - Dashboard principal
    app.get(
      "/dashboard",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Dashboard administrativo",
          description: "Retorna estatísticas principais do dashboard",
        },
      },
      this.getDashboard.bind(this)
    );

    // GET /api/v1/admin/stats/users - Estatísticas de usuários
    app.get(
      "/stats/users",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Estatísticas de usuários",
          description: "Retorna estatísticas de crescimento de usuários",
        },
      },
      this.getUserStats.bind(this)
    );

    // ========================================
    // LOG DE AÇÕES
    // ========================================

    // GET /api/v1/admin/actions - Log de ações administrativas
    app.get<{ Querystring: GetAdminActionsQuery }>(
      "/actions",
      {
        preHandler: [requireAdmin],
        schema: {
          tags: ["admin"],
          summary: "Log de ações",
          description: "Lista todas as ações administrativas registradas",
        },
      },
      this.getActions.bind(this)
    );
  }

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Handler: Login de admin
   */
  private async login(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { email, password } = adminLoginSchema.parse(request.body);

      const result = await this.adminService.login(email, password);

      reply.status(200).send(result);
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao fazer login" });
      }
    }
  }

  /**
   * Handler: Buscar sessão atual
   */
  private async getSession(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const admin = (request as any).admin;
      const { passwordHash, ...adminWithoutPassword } = admin;

      reply.status(200).send({ admin: adminWithoutPassword });
    } catch (error) {
      reply.status(500).send({ error: "Erro ao buscar sessão" });
    }
  }

  /**
   * Handler: Criar admin
   */
  private async createAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const data = createAdminSchema.parse(request.body);
      const adminId = (request as any).admin.id;

      const admin = await this.adminService.createAdmin(data, adminId);

      reply.status(201).send(admin);
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao criar admin" });
      }
    }
  }

  /**
   * Handler: Listar admins
   */
  private async listAdmins(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const query = listAdminsQuerySchema.parse(request.query);

      const result = await this.adminService.listAdmins(query);

      reply.status(200).send(result);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao listar admins" });
    }
  }

  /**
   * Handler: Buscar admin por ID
   */
  private async getAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = adminIdSchema.parse(request.params);

      const admin = await this.adminService.getAdmin(id);

      reply.status(200).send(admin);
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao buscar admin" });
      }
    }
  }

  /**
   * Handler: Atualizar admin
   */
  private async updateAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = adminIdSchema.parse(request.params);
      const data = updateAdminSchema.parse(request.body);
      const adminId = (request as any).admin.id;

      const admin = await this.adminService.updateAdmin(id, data, adminId);

      reply.status(200).send(admin);
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao atualizar admin" });
      }
    }
  }

  /**
   * Handler: Deletar admin
   */
  private async deleteAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = adminIdSchema.parse(request.params);
      const adminId = (request as any).admin.id;

      await this.adminService.deleteAdmin(id, adminId);

      reply.status(204).send();
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao deletar admin" });
      }
    }
  }

  /**
   * Handler: Trocar senha
   */
  private async changePassword(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = adminIdSchema.parse(request.params);
      const { currentPassword, newPassword } = updateAdminPasswordSchema.parse(
        request.body
      );
      const adminId = (request as any).admin.id;

      // Admin só pode trocar própria senha ou SUPER_ADMIN trocar de qualquer um
      const admin = (request as any).admin;
      if (id !== adminId && admin.role !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send({ error: "Você só pode trocar sua própria senha" });
      }

      await this.adminService.changePassword(id, currentPassword, newPassword);

      reply.status(200).send({ message: "Senha atualizada com sucesso" });
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao trocar senha" });
      }
    }
  }

  /**
   * Handler: Listar usuários
   */
  async getUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const query = getUsersQuerySchema.parse(request.query);

      const { page, limit, userType, isActive, search, sortBy, sortOrder } =
        query;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};

      if (userType) {
        where.userType = userType;
      }

      if (isActive !== undefined) {
        where.isEmailVerified = isActive; // Usar como flag de ativo
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      // Buscar usuários
      const [users, total] = await Promise.all([
        this.userRepository.findMany({
          skip,
          take: limit,
          where,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.userRepository.count(where),
      ]);

      // Remover senhas
      const usersWithoutPassword = users.map((user) => {
        const { passwordHash, ...rest } = user;
        return rest;
      });

      reply.status(200).send({
        data: usersWithoutPassword,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      reply.status(500).send({ error: "Erro ao listar usuários" });
    }
  }

  /**
   * Handler: Detalhes de usuário
   */
  async getUserDetails(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = userIdSchema.parse(request.params);

      const user = await this.userRepository.findById(id);

      if (!user) {
        return reply.status(404).send({ error: "Usuário não encontrado" });
      }

      const { passwordHash, ...userWithoutPassword } = user;

      reply.status(200).send(userWithoutPassword);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao buscar usuário" });
    }
  }

  /**
   * Handler: Suspender usuário
   */
  async suspendUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = userIdSchema.parse(request.params);
      const { reason, permanent, suspendedUntil } = suspendUserSchema.parse(
        request.body
      );
      const adminId = (request as any).admin.id;

      const suspendedUntilDate = suspendedUntil
        ? new Date(suspendedUntil)
        : undefined;

      await this.adminService.suspendUser(
        id,
        reason,
        permanent,
        suspendedUntilDate,
        adminId
      );

      reply.status(200).send({ message: "Usuário suspenso com sucesso" });
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao suspender usuário" });
      }
    }
  }

  /**
   * Handler: Ativar usuário
   */
  async activateUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = userIdSchema.parse(request.params);
      const adminId = (request as any).admin.id;

      await this.adminService.activateUser(id, adminId);

      reply.status(200).send({ message: "Usuário ativado com sucesso" });
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao ativar usuário" });
      }
    }
  }

  /**
   * Handler: Deletar usuário permanentemente
   */
  async deleteUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = userIdSchema.parse(request.params);
      const adminId = (request as any).admin.id;

      await this.adminService.deleteUserPermanently(id, adminId);

      reply.status(204).send();
    } catch (error: any) {
      if (error.statusCode) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao deletar usuário" });
      }
    }
  }

  /**
   * Handler: Dashboard
   */
  async getDashboard(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const stats = await this.adminService.getDashboardStats();

      reply.status(200).send(stats);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao buscar estatísticas" });
    }
  }

  /**
   * Handler: Estatísticas de usuários
   */
  async getUserStats(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { period = "month", userType = "ALL" } = request.query as any;

      const stats = await this.adminService.getUserStats(period, userType);

      reply.status(200).send(stats);
    } catch (error) {
      reply
        .status(500)
        .send({ error: "Erro ao buscar estatísticas de usuários" });
    }
  }

  /**
   * Handler: Log de ações
   */
  async getActions(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const query = getAdminActionsQuery.parse(request.query);

      const result = await this.adminService.getAdminActions(query);

      reply.status(200).send(result);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao buscar log de ações" });
    }
  }
}
