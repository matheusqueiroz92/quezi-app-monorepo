import { type User } from "@prisma/client";
import { UserRepository } from "../users/user.repository";
import { ConflictError, UnauthorizedError } from "../../utils/app-error";
import { hashPassword, verifyPassword } from "../../utils/password";
import { type CreateUserInput } from "../users/user.schema";

/**
 * Service de Autenticação
 *
 * Responsável por:
 * - Registro de usuários
 * - Login
 * - Gerenciamento de sessões
 */
export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Registra novo usuário com senha hash
   */
  async register(data: CreateUserInput): Promise<Omit<User, "passwordHash">> {
    // Verifica se email já existe
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new ConflictError("Email já cadastrado");
    }

    // Hash da senha com BCrypt
    const passwordHash = await hashPassword(data.password);

    // Cria usuário
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      phone: data.phone,
      userType: data.userType,
    });

    // Remove passwordHash da resposta
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Realiza login do usuário
   */
  async login(data: {
    email: string;
    password: string;
  }): Promise<Omit<User, "passwordHash">> {
    // Busca usuário por email
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    // Verifica senha
    const isPasswordValid = await verifyPassword(
      data.password,
      user.passwordHash || ""
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    // Remove passwordHash da resposta
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
