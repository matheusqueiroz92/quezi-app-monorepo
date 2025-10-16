import { type User, type UserType } from "@prisma/client";
import { UserRepository } from "./user.repository";
import {
  AppError,
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../utils/app-error";
import { type CreateUserInput, type UpdateUserInput } from "./user.schema";
import { type PaginatedResponse } from "../../types";
import { hashPassword } from "../../utils/password";

/**
 * Camada de Serviço - Lógica de Negócio
 * Responsável por toda a lógica de negócio relacionada a Users
 */
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Cria um novo usuário
   */
  async createUser(data: CreateUserInput): Promise<Omit<User, "passwordHash">> {
    // Verifica se email já existe
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new ConflictError("Email já cadastrado");
    }

    // Hash da senha com BCrypt
    const hashedPassword = await hashPassword(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      phone: data.phone,
      userType: data.userType,
    });

    // Remove passwordHash da resposta
    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string): Promise<Omit<User, "passwordHash">> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("Usuário");
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Lista usuários com paginação e filtros
   */
  async listUsers(params: {
    page: number;
    limit: number;
    userType?: UserType;
    search?: string;
  }): Promise<PaginatedResponse<Omit<User, "passwordHash">>> {
    const { page, limit, userType, search } = params;
    const skip = (page - 1) * limit;

    // Constrói filtros
    const where: any = {};

    if (userType) {
      where.userType = userType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Busca usuários
    const [users, total] = await Promise.all([
      this.userRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      this.userRepository.count(where),
    ]);

    // Remove passwordHash de todos os usuários
    const usersWithoutPassword = users.map(({ passwordHash, ...user }) => user);

    return {
      data: usersWithoutPassword,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(
    id: string,
    data: UpdateUserInput
  ): Promise<Omit<User, "passwordHash">> {
    // Verifica se usuário existe
    const userExists = await this.userRepository.findById(id);
    if (!userExists) {
      throw new NotFoundError("Usuário");
    }

    // Se está alterando email, verifica se não existe outro usuário com esse email
    if (data.email) {
      const emailExists = await this.userRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new ConflictError("Email já cadastrado");
      }
    }

    const user = await this.userRepository.update(id, data);

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(id: string): Promise<void> {
    const userExists = await this.userRepository.findById(id);
    if (!userExists) {
      throw new NotFoundError("Usuário");
    }

    await this.userRepository.delete(id);
  }
}
