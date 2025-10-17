// @ts-nocheck - Tipos do Prisma serão gerados após regenerar Client
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

// Tipos temporários até regenerar Prisma Client
type Organization = any;
type OrganizationMember = any;
type OrganizationInvite = any;
type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

/**
 * Camada de Repositório - Organizations
 * Responsável por operações de banco de dados de organizações
 */
export class OrganizationRepository {
  /**
   * Cria uma nova organização
   */
  async create(data: any): Promise<Organization> {
    // @ts-ignore - Tabela será criada após migration
    return await prisma.organization.create({
      data,
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Busca organização por ID
   */
  async findById(id: string): Promise<Organization | null> {
    // @ts-ignore - Tabela será criada após migration
    return await prisma.organization.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Verifica se slug já existe
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    // @ts-ignore - Tabela será criada após migration
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) return false;
    if (excludeId && org.id === excludeId) return false;

    return true;
  }

  /**
   * Adiciona membro à organização
   */
  async addMember(data: {
    organizationId: string;
    userId: string;
    role: OrganizationRole;
  }): Promise<OrganizationMember> {
    // @ts-ignore - Tabela será criada após migration
    return await prisma.organizationMember.create({
      data,
      include: {
        user: true,
        organization: true,
      },
    });
  }

  /**
   * Obtém role de um membro na organização
   */
  async getMemberRole(
    organizationId: string,
    userId: string
  ): Promise<OrganizationRole | null> {
    // @ts-ignore - Tabela será criada após migration
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    return member?.role || null;
  }

  /**
   * Cria convite para organização
   */
  async createInvite(data: {
    organizationId: string;
    email: string;
    role: OrganizationRole;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<OrganizationInvite> {
    // @ts-ignore - Tabela será criada após migration
    return await prisma.organizationInvite.create({
      data,
      include: {
        organization: true,
        inviter: true,
      },
    });
  }

  /**
   * Atualiza role de um membro
   */
  async updateMemberRole(
    memberId: string,
    role: OrganizationRole
  ): Promise<OrganizationMember> {
    // @ts-ignore - Tabela será criada após migration
    return await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  /**
   * Lista organizações de um usuário
   */
  async findUserOrganizations(userId: string): Promise<Organization[]> {
    // @ts-ignore - Tabela será criada após migration
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            owner: true,
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((m: any) => m.organization);
  }

  /**
   * Remove membro da organização
   */
  async removeMember(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMember> {
    // @ts-ignore - Tabela será criada após migration
    return await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }
}
