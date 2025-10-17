import { type FastifyRequest, type FastifyReply } from "fastify";
import { type OrganizationRole } from "@prisma/client";
import { OrganizationService } from "../modules/organizations/organization.service";
import { ForbiddenError, UnauthorizedError } from "../utils/app-error";

/**
 * Middleware RBAC (Role-Based Access Control)
 * 
 * Verifica se usuário autenticado tem permissão na organização
 */

/**
 * Cria middleware que requer determinadas roles
 */
export function requireOrganizationRole(allowedRoles: OrganizationRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Verifica se usuário está autenticado
    if (!request.user) {
      throw new UnauthorizedError("Usuário não autenticado");
    }

    // Obtém organizationId dos params ou body
    const organizationId =
      (request.params as any).organizationId ||
      (request.body as any)?.organizationId;

    if (!organizationId) {
      throw new ForbiddenError("ID da organização não fornecido");
    }

    // Verifica permissão
    const organizationService = new OrganizationService();
    const hasPermission = await organizationService.checkPermission(
      organizationId,
      request.user.id,
      allowedRoles
    );

    if (!hasPermission) {
      throw new ForbiddenError(
        `Permissão negada. Roles necessárias: ${allowedRoles.join(", ")}`
      );
    }
  };
}

/**
 * Middleware que requer ser OWNER
 */
export const requireOwner = requireOrganizationRole(["OWNER"]);

/**
 * Middleware que requer ser OWNER ou ADMIN
 */
export const requireAdmin = requireOrganizationRole(["OWNER", "ADMIN"]);

/**
 * Middleware que requer ser membro (qualquer role)
 */
export const requireMember = requireOrganizationRole([
  "OWNER",
  "ADMIN",
  "MEMBER",
]);

