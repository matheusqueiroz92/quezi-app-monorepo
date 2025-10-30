import { type Admin, type AdminRole } from "@prisma/client";
import { AdminRepository } from "../../infrastructure/repositories/admin.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { hashPassword, verifyPassword } from "../../utils/password";
import { prisma } from "../../lib/prisma";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from "../../utils/app-error";
import * as jwt from "jsonwebtoken";
import { env } from "../../config/env";

/**
 * Camada de Service - Lógica de Negócio
 * Responsável pelas regras de negócio do módulo Admin
 */
export class AdminService {
  private adminRepository: AdminRepository;
  private userRepository: UserRepository;

  constructor(
    adminRepository: AdminRepository = new AdminRepository(),
    userRepository: UserRepository = new UserRepository(prisma)
  ) {
    this.adminRepository = adminRepository;
    this.userRepository = userRepository;
  }

  /**
   * Login de admin (retorna token JWT)
   */
  async login(
    email: string,
    password: string
  ): Promise<{ admin: Omit<Admin, "passwordHash">; token: string }> {
    // Buscar admin por email
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // Verificar se admin está ativo
    if (!admin.isActive) {
      throw new UnauthorizedError("Admin inativo");
    }

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // Atualizar último login
    await this.adminRepository.updateLastLogin(admin.id);

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        type: "admin",
      },
      env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Remover senha do retorno
    const { passwordHash, ...adminWithoutPassword } = admin;

    return {
      admin: adminWithoutPassword,
      token,
    };
  }

  /**
   * Valida token JWT de admin
   */
  async validateToken(token: string): Promise<Admin> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;

      if (decoded.type !== "admin") {
        throw new UnauthorizedError("Token inválido");
      }

      const admin = await this.adminRepository.findById(decoded.id);

      if (!admin || !admin.isActive) {
        throw new UnauthorizedError("Admin inválido ou inativo");
      }

      return admin;
    } catch (error) {
      throw new UnauthorizedError("Token inválido ou expirado");
    }
  }

  /**
   * Cria um novo admin (apenas SUPER_ADMIN pode criar)
   */
  async createAdmin(
    data: {
      email: string;
      password: string;
      name: string;
      role: AdminRole;
      permissions?: any;
    },
    requestingAdminId: string
  ): Promise<Omit<Admin, "passwordHash">> {
    // Verificar se quem está criando é SUPER_ADMIN
    const requestingAdmin = await this.adminRepository.findById(
      requestingAdminId
    );

    if (!requestingAdmin || requestingAdmin.role !== "SUPER_ADMIN") {
      throw new ForbiddenError(
        "Apenas SUPER_ADMIN pode criar novos administradores"
      );
    }

    // Verificar se email já existe
    const emailExists = await this.adminRepository.emailExists(data.email);

    if (emailExists) {
      throw new ConflictError("Email já cadastrado");
    }

    // Hash da senha
    const passwordHash = await hashPassword(data.password);

    // Criar admin
    const admin = await this.adminRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      permissions: data.permissions,
    });

    // Registrar ação no log
    await this.adminRepository.logAction({
      adminId: requestingAdminId,
      action: "ADMIN_CREATED",
      entityType: "Admin",
      entityId: admin.id,
      details: { role: admin.role, name: admin.name },
    });

    // Remover senha do retorno
    const { passwordHash: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Busca admin por ID
   */
  async getAdmin(id: string): Promise<Omit<Admin, "passwordHash">> {
    const admin = await this.adminRepository.findById(id);

    if (!admin) {
      throw new NotFoundError("Admin");
    }

    const { passwordHash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Lista admins com paginação e filtros
   */
  async listAdmins(params: {
    page: number;
    limit: number;
    role?: AdminRole;
    isActive?: boolean;
    search?: string;
  }): Promise<{
    data: Omit<Admin, "passwordHash">[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, role, isActive, search } = params;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Buscar admins
    const [admins, total] = await Promise.all([
      this.adminRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      this.adminRepository.count(where),
    ]);

    // Remover senhas
    const adminsWithoutPassword = admins.map((admin) => {
      const { passwordHash, ...rest } = admin;
      return rest;
    });

    return {
      data: adminsWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Atualiza um admin (apenas SUPER_ADMIN)
   */
  async updateAdmin(
    id: string,
    data: {
      name?: string;
      role?: AdminRole;
      permissions?: any;
      isActive?: boolean;
    },
    requestingAdminId: string
  ): Promise<Omit<Admin, "passwordHash">> {
    // Verificar se quem está atualizando é SUPER_ADMIN
    const requestingAdmin = await this.adminRepository.findById(
      requestingAdminId
    );

    if (!requestingAdmin || requestingAdmin.role !== "SUPER_ADMIN") {
      throw new ForbiddenError(
        "Apenas SUPER_ADMIN pode atualizar administradores"
      );
    }

    // Verificar se admin existe
    const admin = await this.adminRepository.findById(id);

    if (!admin) {
      throw new NotFoundError("Admin");
    }

    // Atualizar
    const updatedAdmin = await this.adminRepository.update(id, data);

    // Registrar ação no log
    await this.adminRepository.logAction({
      adminId: requestingAdminId,
      action: "ADMIN_UPDATED",
      entityType: "Admin",
      entityId: id,
      details: data,
    });

    const { passwordHash, ...adminWithoutPassword } = updatedAdmin;
    return adminWithoutPassword;
  }

  /**
   * Deleta um admin (apenas SUPER_ADMIN)
   */
  async deleteAdmin(id: string, requestingAdminId: string): Promise<void> {
    // Verificar se quem está deletando é SUPER_ADMIN
    const requestingAdmin = await this.adminRepository.findByEmail(
      requestingAdminId
    );

    if (!requestingAdmin || requestingAdmin.role !== "SUPER_ADMIN") {
      throw new ForbiddenError(
        "Apenas SUPER_ADMIN pode deletar administradores"
      );
    }

    // Não permitir deletar a si mesmo
    if (id === requestingAdminId) {
      throw new BadRequestError("Você não pode deletar a si mesmo");
    }

    // Verificar se admin existe
    const admin = await this.adminRepository.findById(id);

    if (!admin) {
      throw new NotFoundError("Admin");
    }

    // Deletar
    await this.adminRepository.delete(id);

    // Registrar ação no log
    await this.adminRepository.logAction({
      adminId: requestingAdminId,
      action: "ADMIN_DELETED",
      entityType: "Admin",
      entityId: id,
      details: { deletedAdmin: { email: admin.email, role: admin.role } },
    });
  }

  /**
   * Troca senha do admin
   */
  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Buscar admin
    const admin = await this.adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin");
    }

    // Verificar senha atual
    const isPasswordValid = await verifyPassword(
      currentPassword,
      admin.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Senha atual incorreta");
    }

    // Hash da nova senha
    const newPasswordHash = await hashPassword(newPassword);

    // Atualizar senha
    await this.adminRepository.updatePassword(adminId, newPasswordHash);

    // Registrar ação no log
    await this.adminRepository.logAction({
      adminId,
      action: "PASSWORD_CHANGED",
      entityType: "Admin",
      entityId: adminId,
    });
  }

  /**
   * Suspende um usuário
   */
  async suspendUser(
    userId: string,
    reason: string,
    permanent: boolean,
    suspendedUntil: Date | undefined,
    adminId: string
  ): Promise<void> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuário");
    }

    // Atualizar usuário (adicionar campos de suspensão se não existirem no schema)
    // Por enquanto, vamos apenas desativar o usuário
    await this.userRepository.update(userId, {
      isEmailVerified: false, // Usar como flag de suspensão temporariamente
    });

    // Registrar ação no log
    await this.adminRepository.logAction({
      adminId,
      action: "USER_SUSPENDED",
      entityType: "User",
      entityId: userId,
      details: {
        reason,
        permanent,
        suspendedUntil: suspendedUntil?.toISOString(),
        userEmail: user.email,
      },
    });
  }

  /**
   * Ativa um usuário (remove suspensão)
   */
  async activateUser(userId: string, adminId: string): Promise<void> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuário");
    }

    // Reativar usuário
    await this.userRepository.update(userId, {
      isEmailVerified: true,
    });

    // Registrar ação no log
    await this.adminRepository.logAction({
      adminId,
      action: "USER_ACTIVATED",
      entityType: "User",
      entityId: userId,
      details: { userEmail: user.email },
    });
  }

  /**
   * Deleta um usuário permanentemente (apenas SUPER_ADMIN)
   */
  async deleteUserPermanently(userId: string, adminId: string): Promise<void> {
    // Verificar se quem está deletando é SUPER_ADMIN
    const admin = await this.adminRepository.findById(adminId);

    if (!admin || admin.role !== "SUPER_ADMIN") {
      throw new ForbiddenError(
        "Apenas SUPER_ADMIN pode deletar usuários permanentemente"
      );
    }

    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuário");
    }

    // Registrar ação ANTES de deletar
    await this.adminRepository.logAction({
      adminId,
      action: "USER_DELETED_PERMANENTLY",
      entityType: "User",
      entityId: userId,
      details: {
        userEmail: user.email,
        userName: user.name,
        userType: user.userType,
      },
    });

    // Deletar usuário
    await this.userRepository.delete(userId);
  }

  /**
   * Busca ações administrativas com filtros
   */
  async getAdminActions(params: {
    page: number;
    limit: number;
    adminId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { page, limit, adminId, action, entityType, startDate, endDate } =
      params;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (adminId) {
      where.adminId = adminId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Buscar ações
    const [actions, total] = await Promise.all([
      this.adminRepository.getActions({ skip, take: limit, where }),
      this.adminRepository.countActions(where),
    ]);

    return {
      data: actions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Verifica se admin tem permissão específica
   */
  hasPermission(admin: Admin, permission: string): boolean {
    // SUPER_ADMIN tem todas as permissões
    if (admin.role === "SUPER_ADMIN") {
      return true;
    }

    // Verificar permissões customizadas
    if (admin.permissions) {
      const permissions = admin.permissions as any;
      const [category, action] = permission.split(".");

      if (
        permissions[category as string] &&
        permissions[category as string][action as string]
      ) {
        return true;
      }
    }

    // Permissões padrão por role
    const defaultPermissions: Record<string, string[]> = {
      ADMIN: [
        "users.view",
        "users.suspend",
        "users.activate",
        "professionals.approve",
        "professionals.reject",
        "content.moderate",
      ],
      MODERATOR: ["content.moderate", "reviews.delete"],
      SUPPORT: ["users.view"],
      ANALYST: ["analytics.view"],
    };

    const rolePermissions = defaultPermissions[admin.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Busca estatísticas do dashboard
   */
  async getDashboardStats(): Promise<any> {
    // Buscar contagens do banco
    const [
      totalUsers,
      totalClients,
      totalProfessionals,
      totalAppointments,
      totalReviews,
    ] = await Promise.all([
      // this.userRepository.count(),
      // this.userRepository.count({ userType: "CLIENT" }),
      // this.userRepository.count({ userType: "PROFESSIONAL" }),
      0,
      0,
      0, // Valores temporários
      // TODO: Implementar contagem de appointments quando disponível
      Promise.resolve(0),
      // TODO: Implementar contagem de reviews quando disponível
      Promise.resolve(0),
    ]);

    // Buscar dados de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // const newUsersToday = await this.userRepository.count({
    //   createdAt: { gte: today },
    // });
    const newUsersToday = 0; // Valor temporário

    return {
      users: {
        total: totalUsers,
        clients: totalClients,
        professionals: totalProfessionals,
        newToday: newUsersToday,
      },
      appointments: {
        total: totalAppointments,
        pending: 0, // TODO: Implementar
        completed: 0, // TODO: Implementar
        completionRate: 0, // TODO: Calcular
      },
      reviews: {
        total: totalReviews,
        averageRating: 0, // TODO: Calcular
        reportedPending: 0, // TODO: Implementar
      },
      revenue: {
        total: 0, // TODO: Implementar quando tiver payments
        commission: 0, // TODO: Implementar
        today: 0, // TODO: Implementar
      },
    };
  }

  /**
   * Busca estatísticas de usuários por período
   */
  async getUserStats(period: string, userType?: string): Promise<any> {
    // Calcular data de início baseado no período
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Filtros
    const where: any = {
      createdAt: { gte: startDate },
    };

    if (userType && userType !== "ALL") {
      where.userType = userType;
    }

    // Buscar dados
    // const newUsers = await this.userRepository.count(where);
    // const totalUsers = await this.userRepository.count(
    //   userType && userType !== "ALL" ? { userType } : undefined
    // );
    const newUsers = 0; // Valor temporário
    const totalUsers = 0; // Valor temporário

    return {
      period,
      userType: userType || "ALL",
      newUsers,
      totalUsers,
      growthRate:
        totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0,
    };
  }

  // ========================================
  // MÉTODOS DE USUÁRIOS (DELEGAÇÃO PARA USER SERVICE)
  // ========================================

  /**
   * Lista usuários com filtros e paginação
   */
  async getUsers(filters: any): Promise<any> {
    return await this.userRepository.findMany(filters);
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return user;
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, data: any): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return await this.userRepository.update(id, data);
  }

  /**
   * Deleta usuário
   */
  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    await this.userRepository.delete(id);
    return true;
  }

  /**
   * Cria usuário
   */
  async createUser(data: any): Promise<any> {
    return await this.userRepository.create(data);
  }

  // ========================================
  // MÉTODOS DE ADMINISTRADORES
  // ========================================

  /**
   * Lista administradores com filtros e paginação
   */
  async getAdmins(filters: any): Promise<any> {
    return await this.adminRepository.findMany(filters);
  }

  /**
   * Busca administrador por ID
   */
  async getAdminById(id: string): Promise<any> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundError("Administrador não encontrado");
    }
    const { passwordHash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }
}
