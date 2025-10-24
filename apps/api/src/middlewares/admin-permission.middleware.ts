import { type FastifyRequest, type FastifyReply } from "fastify";
import { type Admin } from "@prisma/client";
import { AdminService } from "../application/services/admin.service";
import { UnauthorizedError, ForbiddenError } from "../../../utils/app-error";

/**
 * Middleware de permissões para rotas administrativas
 * Verifica se admin tem permissão para executar a ação
 */
export function requirePermission(permission: string) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const admin = (request as any).admin as Admin;

    if (!admin) {
      throw new UnauthorizedError("Admin não autenticado");
    }

    const adminService = new AdminService();
    const hasPermission = adminService.hasPermission(admin, permission);

    if (!hasPermission) {
      throw new ForbiddenError(`Você não tem permissão para: ${permission}`);
    }
  };
}

/**
 * Middleware que requer role SUPER_ADMIN
 */
export async function requireSuperAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const admin = (request as any).admin as Admin;

  if (!admin) {
    throw new UnauthorizedError("Admin não autenticado");
  }

  if (admin.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Apenas SUPER_ADMIN pode executar esta ação");
  }
}
