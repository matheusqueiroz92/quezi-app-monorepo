import {
  type Admin,
  type AdminAction,
  type AdminRole,
  type Prisma,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";

/**
 * Camada de Repository - Acesso a Dados
 * Responsável por toda a interação com o banco de dados do módulo Admin
 */
export class AdminRepository {
  /**
   * Cria um novo admin
   */
  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: AdminRole;
    permissions?: any;
  }): Promise<Admin> {
    return await prisma.admin.create({
      data,
    });
  }

  /**
   * Busca admin por ID
   */
  async findById(id: string): Promise<Admin | null> {
    return await prisma.admin.findUnique({
      where: { id },
    });
  }

  /**
   * Busca admin por email
   */
  async findByEmail(email: string): Promise<Admin | null> {
    return await prisma.admin.findUnique({
      where: { email },
    });
  }

  /**
   * Lista admins com paginação e filtros
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AdminWhereInput;
    orderBy?: Prisma.AdminOrderByWithRelationInput;
  }): Promise<Admin[]> {
    const { skip, take, where, orderBy } = params;

    return await prisma.admin.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  /**
   * Conta admins com filtros opcionais
   */
  async count(where?: Prisma.AdminWhereInput): Promise<number> {
    return await prisma.admin.count({
      where,
    });
  }

  /**
   * Atualiza um admin
   */
  async update(id: string, data: Prisma.AdminUpdateInput): Promise<Admin> {
    return await prisma.admin.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta um admin
   */
  async delete(id: string): Promise<void> {
    await prisma.admin.delete({
      where: { id },
    });
  }

  /**
   * Verifica se email já existe (com opção de excluir ID)
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const admin = await prisma.admin.findFirst({
      where: {
        email,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return admin !== null;
  }

  /**
   * Atualiza senha do admin
   */
  async updatePassword(id: string, passwordHash: string): Promise<Admin> {
    return await prisma.admin.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Atualiza último login do admin
   */
  async updateLastLogin(id: string): Promise<void> {
    await prisma.admin.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Registra uma ação administrativa no log
   */
  async logAction(data: {
    adminId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AdminAction> {
    return await prisma.adminAction.create({
      data,
    });
  }

  /**
   * Busca ações administrativas com paginação e filtros
   */
  async getActions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AdminActionWhereInput;
  }): Promise<AdminAction[]> {
    const { skip, take, where } = params;

    return await prisma.adminAction.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: "desc" },
      include: { admin: true },
    });
  }

  /**
   * Conta ações administrativas
   */
  async countActions(where?: Prisma.AdminActionWhereInput): Promise<number> {
    return await prisma.adminAction.count({
      where,
    });
  }
}
