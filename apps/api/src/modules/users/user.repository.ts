import { type User, type UserType, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

/**
 * Camada de Repositório - Acesso ao banco de dados
 * Responsável por todas as operações de banco de dados relacionadas a Users
 */
export class UserRepository {
  /**
   * Cria um novo usuário
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data,
      include: {
        professionalProfile: true,
      },
    });
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        professionalProfile: true,
      },
    });
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        professionalProfile: true,
      },
    });
  }

  /**
   * Lista usuários com paginação e filtros
   */
  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return await prisma.user.findMany({
      ...params,
      include: {
        professionalProfile: true,
      },
    });
  }

  /**
   * Conta total de usuários com filtros
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return await prisma.user.count({ where });
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        professionalProfile: true,
      },
    });
  }

  /**
   * Deleta um usuário
   */
  async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Verifica se email já existe
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return false;
    if (excludeId && user.id === excludeId) return false;

    return true;
  }
}
