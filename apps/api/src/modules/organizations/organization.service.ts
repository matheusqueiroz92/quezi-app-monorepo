import { OrganizationRepository } from "./organization.repository";
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

// Tipos temporários até regenerar Prisma Client
type Organization = any;
type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

/**
 * Service de Organizações
 *
 * Responsável por:
 * - CRUD de organizações (salões, clínicas, empresas)
 * - Gerenciamento de membros
 * - Controle de permissões (RBAC)
 * - Convites de membros
 */
export class OrganizationService {
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
  }

  /**
   * Cria nova organização
   * O criador se torna automaticamente OWNER
   */
  async createOrganization(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
  }): Promise<Organization> {
    // Verifica se slug já existe
    const slugExists = await this.organizationRepository.slugExists(data.slug);
    if (slugExists) {
      throw new ConflictError("Slug já está em uso");
    }

    // Cria organização
    const organization = await this.organizationRepository.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      owner: {
        connect: { id: data.ownerId },
      },
    });

    // Adiciona owner como membro com role OWNER
    await this.organizationRepository.addMember({
      organizationId: organization.id,
      userId: data.ownerId,
      role: "OWNER",
    });

    return organization;
  }

  /**
   * Convida membro para organização
   * Apenas OWNER e ADMIN podem convidar
   */
  async inviteMember(data: {
    organizationId: string;
    email: string;
    role: OrganizationRole;
    invitedBy: string;
  }): Promise<any> {
    // Verifica se quem está convidando tem permissão
    const inviterRole = await this.organizationRepository.getMemberRole(
      data.organizationId,
      data.invitedBy
    );

    if (!inviterRole || !["OWNER", "ADMIN"].includes(inviterRole)) {
      throw new ForbiddenError("Apenas owners e admins podem convidar membros");
    }

    // Cria convite que expira em 7 dias
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.organizationRepository.createInvite({
      organizationId: data.organizationId,
      email: data.email,
      role: data.role,
      invitedBy: data.invitedBy,
      expiresAt,
    });

    return invite;
  }

  /**
   * Atualiza role de um membro
   * Apenas OWNER pode atualizar roles
   */
  async updateMemberRole(data: {
    organizationId: string;
    memberId: string;
    newRole: OrganizationRole;
    updatedBy: string;
  }): Promise<any> {
    // Verifica se quem está atualizando é OWNER
    const updaterRole = await this.organizationRepository.getMemberRole(
      data.organizationId,
      data.updatedBy
    );

    if (updaterRole !== "OWNER") {
      throw new ForbiddenError("Apenas owners podem atualizar roles");
    }

    // Atualiza role do membro
    const updatedMember = await this.organizationRepository.updateMemberRole(
      data.memberId,
      data.newRole
    );

    return updatedMember;
  }

  /**
   * Verifica se usuário tem permissão em organização
   */
  async checkPermission(
    organizationId: string,
    userId: string,
    allowedRoles: OrganizationRole[]
  ): Promise<boolean> {
    const userRole = await this.organizationRepository.getMemberRole(
      organizationId,
      userId
    );

    if (!userRole) return false;

    return allowedRoles.includes(userRole);
  }

  /**
   * Lista organizações de um usuário
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    return await this.organizationRepository.findUserOrganizations(userId);
  }

  /**
   * Remove membro da organização
   * Apenas OWNER pode remover membros
   */
  async removeMember(data: {
    organizationId: string;
    memberUserId: string;
    removedBy: string;
  }): Promise<void> {
    // Verifica se quem está removendo é OWNER
    const removerRole = await this.organizationRepository.getMemberRole(
      data.organizationId,
      data.removedBy
    );

    if (removerRole !== "OWNER") {
      throw new ForbiddenError("Apenas owners podem remover membros");
    }

    // Não permite remover o próprio owner
    const memberRole = await this.organizationRepository.getMemberRole(
      data.organizationId,
      data.memberUserId
    );

    if (memberRole === "OWNER") {
      throw new ForbiddenError("Não é possível remover o owner da organização");
    }

    await this.organizationRepository.removeMember(
      data.organizationId,
      data.memberUserId
    );
  }
}
