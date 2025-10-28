import { type FastifyRequest, type FastifyReply } from "fastify";
import { AdminService } from "../application/services/admin.service";
import { UnauthorizedError } from "../utils/app-error";

/**
 * Middleware de autenticação para rotas administrativas
 * Valida token JWT e anexa dados do admin ao request
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Token de autenticação não fornecido");
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("Token de autenticação não fornecido");
  }

  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const adminRepository =
      new (require("../infrastructure/repositories/admin.repository").AdminRepository)(
        prisma
      );
    const userRepository =
      new (require("../infrastructure/repositories/user.repository").UserRepository)(
        prisma
      );
    const adminService = new AdminService(adminRepository, userRepository);
    const admin = await adminService.validateToken(token);

    // Anexar admin ao request
    (request as any).admin = admin;
  } catch (error) {
    throw new UnauthorizedError("Token inválido ou expirado");
  }
}
