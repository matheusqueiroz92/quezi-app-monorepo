import { auth } from "../../lib/auth";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de Autenticação
 *
 * Integra com Better Auth para fornecer funcionalidades de:
 * - Registro de usuários
 * - Login/Logout
 * - Reset de senha
 * - Verificação de email
 * - Gerenciamento de sessão
 */
export class AuthService {
  /**
   * Enviar email de recuperação de senha
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      // TODO: Implementar verificação real do usuário
      // Por enquanto, apenas simular o envio
      console.log(`📧 Email de recuperação enviado para: ${email}`);

      return {
        message: "Email de recuperação enviado com sucesso",
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao enviar email de recuperação: ${error.message}`
      );
    }
  }

  /**
   * Verificar se token de reset é válido
   */
  async verifyResetToken(
    token: string
  ): Promise<{ valid: boolean; message?: string; error?: string }> {
    try {
      // TODO: Implementar verificação real do token
      // Por enquanto, simular verificação
      if (!token || token.length < 10) {
        return {
          valid: false,
          error: "Token inválido",
        };
      }

      return {
        valid: true,
        message: "Token válido",
      };
    } catch (error: any) {
      return {
        valid: false,
        error: `Erro ao verificar token: ${error.message}`,
      };
    }
  }

  /**
   * Resetar senha com token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      // Verificar se o token é válido
      const tokenValidation = await this.verifyResetToken(token);
      if (!tokenValidation.valid) {
        throw new BadRequestError("Token inválido ou expirado");
      }

      // Validar nova senha
      if (!newPassword || newPassword.length < 8) {
        throw new BadRequestError(
          "Nova senha deve ter pelo menos 8 caracteres"
        );
      }

      // TODO: Implementar reset real da senha
      // Por enquanto, apenas simular
      console.log(`🔐 Senha resetada para token: ${token.substring(0, 10)}...`);

      return {
        message: "Senha resetada com sucesso",
      };
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(`Erro ao resetar senha: ${error.message}`);
    }
  }

  /**
   * Obter sessão do usuário
   */
  async getSession(headers: any): Promise<any> {
    try {
      return await auth.api.getSession({
        headers,
      });
    } catch (error: any) {
      throw new BadRequestError(`Erro ao obter sessão: ${error.message}`);
    }
  }

  /**
   * Fazer login com email e senha
   */
  async signIn(email: string, password: string): Promise<any> {
    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });

      return result;
    } catch (error: any) {
      throw new BadRequestError(`Erro ao fazer login: ${error.message}`);
    }
  }

  /**
   * Registrar novo usuário
   */
  async signUp(
    email: string,
    password: string,
    name: string,
    userType: string = "CLIENT"
  ): Promise<any> {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          userType,
        },
      });

      return result;
    } catch (error: any) {
      throw new BadRequestError(`Erro ao registrar usuário: ${error.message}`);
    }
  }

  /**
   * Fazer logout
   */
  async signOut(sessionId: string): Promise<{ message: string }> {
    try {
      await auth.api.signOut({
        headers: {
          "x-session-id": sessionId,
        },
      });

      return {
        message: "Logout realizado com sucesso",
      };
    } catch (error: any) {
      throw new BadRequestError(`Erro ao fazer logout: ${error.message}`);
    }
  }
}
