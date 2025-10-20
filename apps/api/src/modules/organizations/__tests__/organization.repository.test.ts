import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { OrganizationRepository } from "../organization.repository";
import { prisma } from "../../../lib/prisma";

// Mock do Prisma
jest.mock("../../../lib/prisma", () => ({
  prisma: {
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    organizationMember: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organizationInvite: {
      create: jest.fn(),
    },
  },
}));

describe("OrganizationRepository", () => {
  let repository: OrganizationRepository;
  let prismaMock: any;

  beforeEach(() => {
    repository = new OrganizationRepository();
    prismaMock = prisma;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar uma organização com sucesso", async () => {
      const mockOrganization = {
        id: "org-1",
        name: "Salão Beleza",
        slug: "salao-beleza",
        description: "Salão de beleza completo",
        ownerId: "user-1",
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "user-1",
          name: "João Silva",
          email: "joao@test.com",
        },
        members: [],
      };

      (prismaMock.organization.create as jest.Mock).mockResolvedValue(
        mockOrganization
      );

      const data = {
        name: "Salão Beleza",
        slug: "salao-beleza",
        description: "Salão de beleza completo",
        owner: {
          connect: { id: "user-1" },
        },
      };

      const result = await repository.create(data);

      expect(result).toEqual(mockOrganization);
      expect(prismaMock.organization.create).toHaveBeenCalledWith({
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
    });

    it("deve incluir owner e members na resposta", async () => {
      const mockOrganization = {
        id: "org-1",
        name: "Test Org",
        slug: "test-org",
        ownerId: "user-1",
        owner: { id: "user-1", name: "Owner" },
        members: [
          {
            id: "member-1",
            userId: "user-1",
            role: "OWNER",
            user: { id: "user-1", name: "Owner" },
          },
        ],
      };

      (prismaMock.organization.create as jest.Mock).mockResolvedValue(
        mockOrganization
      );

      const result = await repository.create({
        name: "Test Org",
        slug: "test-org",
        owner: { connect: { id: "user-1" } },
      });

      expect(result.owner).toBeDefined();
      expect(result.members).toBeDefined();
      expect(result.members.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("findById", () => {
    it("deve buscar organização por ID com sucesso", async () => {
      const mockOrganization = {
        id: "org-1",
        name: "Test Organization",
        slug: "test-org",
        description: "Test description",
        ownerId: "user-1",
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "user-1",
          name: "Owner User",
          email: "owner@test.com",
        },
        members: [],
      };

      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue(
        mockOrganization
      );

      const result = await repository.findById("org-1");

      expect(result).toEqual(mockOrganization);
      expect(prismaMock.organization.findUnique).toHaveBeenCalledWith({
        where: { id: "org-1" },
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });
    });

    it("deve retornar null se organização não existir", async () => {
      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });

    it("deve incluir owner e members na resposta", async () => {
      const mockOrganization = {
        id: "org-1",
        name: "Test Org",
        owner: { id: "user-1", name: "Owner" },
        members: [{ id: "member-1", user: { id: "user-2", name: "Member" } }],
      };

      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue(
        mockOrganization
      );

      const result = await repository.findById("org-1");

      expect(result?.owner).toBeDefined();
      expect(result?.members).toBeDefined();
      expect(result?.members.length).toBe(1);
    });
  });

  describe("slugExists", () => {
    it("deve retornar true se slug existir", async () => {
      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue({
        id: "org-1",
      });

      const result = await repository.slugExists("existing-slug");

      expect(result).toBe(true);
      expect(prismaMock.organization.findUnique).toHaveBeenCalledWith({
        where: { slug: "existing-slug" },
        select: { id: true },
      });
    });

    it("deve retornar false se slug não existir", async () => {
      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.slugExists("non-existent-slug");

      expect(result).toBe(false);
    });

    it("deve retornar false se slug existir mas for da mesma organização (excludeId)", async () => {
      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue({
        id: "org-1",
      });

      const result = await repository.slugExists("my-slug", "org-1");

      expect(result).toBe(false);
    });

    it("deve retornar true se slug existir e for de outra organização", async () => {
      (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue({
        id: "org-2",
      });

      const result = await repository.slugExists("my-slug", "org-1");

      expect(result).toBe(true);
    });
  });

  describe("addMember", () => {
    it("deve adicionar membro à organização com sucesso", async () => {
      const mockMember = {
        id: "member-1",
        organizationId: "org-1",
        userId: "user-2",
        role: "MEMBER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-2",
          name: "Novo Membro",
          email: "membro@test.com",
        },
        organization: {
          id: "org-1",
          name: "Test Org",
          slug: "test-org",
        },
      };

      (prismaMock.organizationMember.create as jest.Mock).mockResolvedValue(
        mockMember
      );

      const data = {
        organizationId: "org-1",
        userId: "user-2",
        role: "MEMBER" as const,
      };

      const result = await repository.addMember(data);

      expect(result).toEqual(mockMember);
      expect(prismaMock.organizationMember.create).toHaveBeenCalledWith({
        data,
        include: {
          user: true,
          organization: true,
        },
      });
    });

    it("deve permitir adicionar membro com role OWNER", async () => {
      const mockMember = {
        id: "member-1",
        organizationId: "org-1",
        userId: "user-1",
        role: "OWNER" as const,
        user: { id: "user-1", name: "Owner" },
        organization: { id: "org-1", name: "Org" },
      };

      (prismaMock.organizationMember.create as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await repository.addMember({
        organizationId: "org-1",
        userId: "user-1",
        role: "OWNER",
      });

      expect(result.role).toBe("OWNER");
    });

    it("deve permitir adicionar membro com role ADMIN", async () => {
      const mockMember = {
        id: "member-1",
        organizationId: "org-1",
        userId: "user-2",
        role: "ADMIN" as const,
        user: { id: "user-2", name: "Admin" },
        organization: { id: "org-1", name: "Org" },
      };

      (prismaMock.organizationMember.create as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await repository.addMember({
        organizationId: "org-1",
        userId: "user-2",
        role: "ADMIN",
      });

      expect(result.role).toBe("ADMIN");
    });

    it("deve incluir user e organization na resposta", async () => {
      const mockMember = {
        id: "member-1",
        user: { id: "user-2", name: "User" },
        organization: { id: "org-1", name: "Org" },
      };

      (prismaMock.organizationMember.create as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await repository.addMember({
        organizationId: "org-1",
        userId: "user-2",
        role: "MEMBER",
      });

      expect(result.user).toBeDefined();
      expect(result.organization).toBeDefined();
    });
  });

  describe("getMemberRole", () => {
    it("deve retornar role do membro", async () => {
      const mockMember = {
        role: "ADMIN" as const,
      };

      (prismaMock.organizationMember.findUnique as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await repository.getMemberRole("org-1", "user-1");

      expect(result).toBe("ADMIN");
      expect(prismaMock.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_userId: {
            organizationId: "org-1",
            userId: "user-1",
          },
        },
        select: {
          role: true,
        },
      });
    });

    it("deve retornar null se membro não existir", async () => {
      (prismaMock.organizationMember.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      const result = await repository.getMemberRole("org-1", "non-member");

      expect(result).toBeNull();
    });

    it("deve retornar role OWNER corretamente", async () => {
      (prismaMock.organizationMember.findUnique as jest.Mock).mockResolvedValue(
        { role: "OWNER" }
      );

      const result = await repository.getMemberRole("org-1", "user-1");

      expect(result).toBe("OWNER");
    });

    it("deve retornar role MEMBER corretamente", async () => {
      (prismaMock.organizationMember.findUnique as jest.Mock).mockResolvedValue(
        { role: "MEMBER" }
      );

      const result = await repository.getMemberRole("org-1", "user-1");

      expect(result).toBe("MEMBER");
    });
  });

  describe("createInvite", () => {
    it("deve criar convite com sucesso", async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockInvite = {
        id: "invite-1",
        organizationId: "org-1",
        email: "novomembro@test.com",
        role: "MEMBER" as const,
        invitedBy: "user-1",
        status: "PENDING" as const,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: {
          id: "org-1",
          name: "Test Org",
          slug: "test-org",
        },
        inviter: {
          id: "user-1",
          name: "Admin User",
          email: "admin@test.com",
        },
      };

      (prismaMock.organizationInvite.create as jest.Mock).mockResolvedValue(
        mockInvite
      );

      const data = {
        organizationId: "org-1",
        email: "novomembro@test.com",
        role: "MEMBER" as const,
        invitedBy: "user-1",
        expiresAt,
      };

      const result = await repository.createInvite(data);

      expect(result).toEqual(mockInvite);
      expect(prismaMock.organizationInvite.create).toHaveBeenCalledWith({
        data,
        include: {
          organization: true,
          inviter: true,
        },
      });
    });

    it("deve incluir organization e inviter na resposta", async () => {
      const mockInvite = {
        id: "invite-1",
        organization: { id: "org-1", name: "Org" },
        inviter: { id: "user-1", name: "Inviter" },
      };

      (prismaMock.organizationInvite.create as jest.Mock).mockResolvedValue(
        mockInvite
      );

      const result = await repository.createInvite({
        organizationId: "org-1",
        email: "test@test.com",
        role: "MEMBER",
        invitedBy: "user-1",
        expiresAt: new Date(),
      });

      expect(result.organization).toBeDefined();
      expect(result.inviter).toBeDefined();
    });

    it("deve criar convite com role ADMIN", async () => {
      const mockInvite = {
        id: "invite-1",
        role: "ADMIN" as const,
        organization: { id: "org-1" },
        inviter: { id: "user-1" },
      };

      (prismaMock.organizationInvite.create as jest.Mock).mockResolvedValue(
        mockInvite
      );

      const result = await repository.createInvite({
        organizationId: "org-1",
        email: "admin@test.com",
        role: "ADMIN",
        invitedBy: "user-1",
        expiresAt: new Date(),
      });

      expect(result.role).toBe("ADMIN");
    });
  });

  describe("updateMemberRole", () => {
    it("deve atualizar role do membro com sucesso", async () => {
      const mockUpdatedMember = {
        id: "member-1",
        organizationId: "org-1",
        userId: "user-2",
        role: "ADMIN" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-2",
          name: "Promoted User",
          email: "user@test.com",
        },
        organization: {
          id: "org-1",
          name: "Test Org",
          slug: "test-org",
        },
      };

      (prismaMock.organizationMember.update as jest.Mock).mockResolvedValue(
        mockUpdatedMember
      );

      const result = await repository.updateMemberRole("member-1", "ADMIN");

      expect(result).toEqual(mockUpdatedMember);
      expect(result.role).toBe("ADMIN");
      expect(prismaMock.organizationMember.update).toHaveBeenCalledWith({
        where: { id: "member-1" },
        data: { role: "ADMIN" },
        include: {
          user: true,
          organization: true,
        },
      });
    });

    it("deve permitir rebaixar de ADMIN para MEMBER", async () => {
      const mockMember = {
        id: "member-1",
        role: "MEMBER" as const,
        user: { id: "user-2" },
        organization: { id: "org-1" },
      };

      (prismaMock.organizationMember.update as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await repository.updateMemberRole("member-1", "MEMBER");

      expect(result.role).toBe("MEMBER");
    });

    it("deve incluir user e organization na resposta", async () => {
      const mockMember = {
        id: "member-1",
        role: "ADMIN",
        user: { id: "user-2", name: "User" },
        organization: { id: "org-1", name: "Org" },
      };

      (prismaMock.organizationMember.update as jest.Mock).mockResolvedValue(
        mockMember
      );

      const result = await repository.updateMemberRole("member-1", "ADMIN");

      expect(result.user).toBeDefined();
      expect(result.organization).toBeDefined();
    });
  });

  describe("findUserOrganizations", () => {
    it("deve listar organizações do usuário", async () => {
      const mockMemberships = [
        {
          id: "member-1",
          userId: "user-1",
          organization: {
            id: "org-1",
            name: "Org 1",
            slug: "org-1",
            owner: { id: "user-1", name: "Owner" },
            members: [],
          },
        },
        {
          id: "member-2",
          userId: "user-1",
          organization: {
            id: "org-2",
            name: "Org 2",
            slug: "org-2",
            owner: { id: "user-3", name: "Other Owner" },
            members: [],
          },
        },
      ];

      (prismaMock.organizationMember.findMany as jest.Mock).mockResolvedValue(
        mockMemberships
      );

      const result = await repository.findUserOrganizations("user-1");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("org-1");
      expect(result[1].id).toBe("org-2");
      expect(prismaMock.organizationMember.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
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
    });

    it("deve retornar array vazio se usuário não pertence a nenhuma organização", async () => {
      (prismaMock.organizationMember.findMany as jest.Mock).mockResolvedValue(
        []
      );

      const result = await repository.findUserOrganizations(
        "user-with-no-orgs"
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("deve incluir owner e members de cada organização", async () => {
      const mockMemberships = [
        {
          id: "member-1",
          organization: {
            id: "org-1",
            name: "Org",
            owner: { id: "owner-1", name: "Owner" },
            members: [
              { id: "m1", user: { id: "u1", name: "User 1" } },
              { id: "m2", user: { id: "u2", name: "User 2" } },
            ],
          },
        },
      ];

      (prismaMock.organizationMember.findMany as jest.Mock).mockResolvedValue(
        mockMemberships
      );

      const result = await repository.findUserOrganizations("user-1");

      expect(result[0].owner).toBeDefined();
      expect(result[0].members).toBeDefined();
      expect(result[0].members).toHaveLength(2);
    });
  });

  describe("removeMember", () => {
    it("deve remover membro da organização com sucesso", async () => {
      const mockRemovedMember = {
        id: "member-1",
        organizationId: "org-1",
        userId: "user-2",
        role: "MEMBER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaMock.organizationMember.delete as jest.Mock).mockResolvedValue(
        mockRemovedMember
      );

      const result = await repository.removeMember("org-1", "user-2");

      expect(result).toEqual(mockRemovedMember);
      expect(prismaMock.organizationMember.delete).toHaveBeenCalledWith({
        where: {
          organizationId_userId: {
            organizationId: "org-1",
            userId: "user-2",
          },
        },
      });
    });

    it("deve usar chave composta organizationId_userId", async () => {
      const mockMember = {
        id: "member-1",
        organizationId: "org-123",
        userId: "user-456",
        role: "MEMBER",
      };

      (prismaMock.organizationMember.delete as jest.Mock).mockResolvedValue(
        mockMember
      );

      await repository.removeMember("org-123", "user-456");

      expect(prismaMock.organizationMember.delete).toHaveBeenCalledWith({
        where: {
          organizationId_userId: {
            organizationId: "org-123",
            userId: "user-456",
          },
        },
      });
    });
  });
});
