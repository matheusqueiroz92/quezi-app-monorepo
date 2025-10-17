import {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import { OrganizationService } from "./organization.service";
import {
  createOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  type CreateOrganizationInput,
  type InviteMemberInput,
  type UpdateMemberRoleInput,
} from "./organization.schema";
import { requireAdmin, requireOwner } from "../../middlewares/rbac.middleware";

/**
 * Controller de Organizações
 */
export class OrganizationController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  /**
   * Registra rotas de organizações
   */
  async registerRoutes(app: FastifyInstance): Promise<void> {
    // POST /organizations - Criar organização
    app.post<{ Body: CreateOrganizationInput }>(
      "/",
      {
        schema: {
          tags: ["organizations"],
          description: "Cria nova organização (salão, clínica, empresa)",
          security: [{ bearerAuth: [] }],
          body: {
            type: "object",
            required: ["name", "slug"],
            properties: {
              name: { type: "string", minLength: 3 },
              slug: { type: "string", minLength: 3, pattern: "^[a-z0-9-]+$" },
              description: { type: "string" },
            },
          },
          response: {
            201: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                slug: { type: "string" },
                description: { type: "string" },
                ownerId: { type: "string" },
              },
            },
          },
        },
      },
      this.createOrganization.bind(this)
    );

    // POST /organizations/invite - Convidar membro
    app.post<{ Body: InviteMemberInput }>(
      "/invite",
      {
        preHandler: requireAdmin,
        schema: {
          tags: ["organizations"],
          description:
            "Convida membro para organização (requer OWNER ou ADMIN)",
          security: [{ bearerAuth: [] }],
          body: {
            type: "object",
            required: ["organizationId", "email", "role"],
            properties: {
              organizationId: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              role: { type: "string", enum: ["OWNER", "ADMIN", "MEMBER"] },
            },
          },
        },
      },
      this.inviteMember.bind(this)
    );

    // PUT /organizations/member/role - Atualizar role
    app.put<{ Body: UpdateMemberRoleInput }>(
      "/member/role",
      {
        preHandler: requireOwner,
        schema: {
          tags: ["organizations"],
          description: "Atualiza role de membro (requer OWNER)",
          security: [{ bearerAuth: [] }],
          body: {
            type: "object",
            required: ["organizationId", "memberId", "role"],
            properties: {
              organizationId: { type: "string", format: "uuid" },
              memberId: { type: "string", format: "uuid" },
              role: { type: "string", enum: ["OWNER", "ADMIN", "MEMBER"] },
            },
          },
        },
      },
      this.updateMemberRole.bind(this)
    );

    // GET /organizations/my - Listar minhas organizações
    app.get(
      "/my",
      {
        schema: {
          tags: ["organizations"],
          description: "Lista organizações do usuário autenticado",
          security: [{ bearerAuth: [] }],
          response: {
            200: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
      },
      this.getMyOrganizations.bind(this)
    );
  }

  /**
   * Handler: Criar organização
   */
  private async createOrganization(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      reply.status(401).send({ error: "Não autenticado" });
      return;
    }

    const data = createOrganizationSchema.parse(request.body);

    const organization = await this.organizationService.createOrganization({
      ...data,
      ownerId: request.user.id,
    });

    reply.status(201).send(organization);
  }

  /**
   * Handler: Convidar membro
   */
  private async inviteMember(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      reply.status(401).send({ error: "Não autenticado" });
      return;
    }

    const data = inviteMemberSchema.parse(request.body);

    const invite = await this.organizationService.inviteMember({
      organizationId: data.organizationId,
      email: data.email,
      role: data.role.toUpperCase() as any, // Converte para maiúsculo
      invitedBy: request.user.id,
    });

    reply.status(201).send(invite);
  }

  /**
   * Handler: Atualizar role de membro
   */
  private async updateMemberRole(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      reply.status(401).send({ error: "Não autenticado" });
      return;
    }

    const data = updateMemberRoleSchema.parse(request.body);

    const updatedMember = await this.organizationService.updateMemberRole({
      organizationId: data.organizationId,
      memberId: data.memberId,
      newRole: data.role.toUpperCase() as any,
      updatedBy: request.user.id,
    });

    reply.status(200).send(updatedMember);
  }

  /**
   * Handler: Listar minhas organizações
   */
  private async getMyOrganizations(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      reply.status(401).send({ error: "Não autenticado" });
      return;
    }

    const organizations = await this.organizationService.getUserOrganizations(
      request.user.id
    );

    reply.status(200).send(organizations);
  }
}
