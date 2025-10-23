import { type User } from "@prisma/client";
import { UserRepository } from "../users/user.repository";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "../../utils/app-error";
import { hashPassword, verifyPassword } from "../../utils/password";
import { type CreateUserInput } from "../users/user.schema";
import { prisma } from "../../lib/prisma";
import { randomBytes } from "crypto";

/**
 * Service de Autenticação
 *
 * Responsável por:
 * - Registro de usuários
 * - Login
 * - Gerenciamento de sessões
 * - Reset de senha (forgot password)
 * - Verificação de tokens de reset
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

  /**
   * Gera token de reset de senha e envia email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    // Verificar se usuário existe
    const user = await this.userRepository.findByEmail(email);

    // Por segurança, sempre retornar sucesso mesmo se usuário não existir
    if (!user) {
      return { message: "Email de recuperação enviado com sucesso" };
    }

    // Gerar token único
    const resetToken = randomBytes(32).toString("hex");

    // Definir expiração (24 horas)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Deletar tokens antigos para o email
    await prisma.verification.deleteMany({
      where: {
        identifier: email,
      },
    });

    // Criar novo token
    await prisma.verification.create({
      data: {
        identifier: email,
        value: resetToken,
        expiresAt,
      },
    });

    // TODO: Implementar envio de email real
    console.log("📧 Email de reset de senha:", {
      email,
      token: resetToken,
      resetUrl: `${
        process.env.BETTER_AUTH_URL || "http://localhost:3333"
      }/reset-password?token=${resetToken}`,
    });

    return { message: "Email de recuperação enviado com sucesso" };
  }

  /**
   * Verifica se token de reset é válido
   */
  async verifyResetToken(
    token: string
  ): Promise<{ valid: boolean; message?: string; error?: string }> {
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
        expiresAt: {
          gt: new Date(), // Token não expirado
        },
      },
    });

    if (!verification) {
      return {
        valid: false,
        error: "Token inválido ou expirado",
      };
    }

    return {
      valid: true,
      message: "Token válido",
    };
  }

  /**
   * Reseta senha com token válido
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Verificar se token é válido
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
        expiresAt: {
          gt: new Date(), // Token não expirado
        },
      },
    });

    if (!verification) {
      throw new BadRequestError("Token inválido ou expirado");
    }

    // Buscar usuário pelo email do token
    const user = await this.userRepository.findByEmail(verification.identifier);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Hash da nova senha
    const passwordHash = await hashPassword(newPassword);

    // Atualizar senha do usuário
    await this.userRepository.update(user.id, { passwordHash });

    // Deletar token usado
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    // TODO: Invalidar todas as sessões ativas do usuário
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return { message: "Senha alterada com sucesso" };
  }
}
