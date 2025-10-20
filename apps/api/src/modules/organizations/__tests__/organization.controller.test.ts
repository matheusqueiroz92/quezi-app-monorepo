import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { OrganizationController } from "../organization.controller";
import { OrganizationService } from "../organization.service";

// Mock do service
jest.mock("../organization.service");

describe("OrganizationController", () => {
  let controller: OrganizationController;
  let serviceMock: any;
  let requestMock: any;
  let replyMock: any;

  beforeEach(() => {
    // Criar mock do service
    serviceMock = {
      createOrganization: jest.fn(),
      inviteMember: jest.fn(),
      updateMemberRole: jest.fn(),
      getUserOrganizations: jest.fn(),
    };

    // Mockar OrganizationService constructor
    (
      OrganizationService as jest.MockedClass<typeof OrganizationService>
    ).mockImplementation(() => serviceMock);

    controller = new OrganizationController();

    requestMock = {
      user: { id: "user-1" },
      body: {},
      params: {},
      query: {},
    };

    replyMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("createOrganization", () => {
    it("deve criar organização com sucesso", async () => {
      const mockOrganization = {
        id: "org-1",
        name: "Salão Beleza",
        slug: "salao-beleza",
        description: "Salão completo",
        ownerId: "user-1",
      };

      requestMock.body = {
        name: "Salão Beleza",
        slug: "salao-beleza",
        description: "Salão completo",
      };

      serviceMock.createOrganization.mockResolvedValue(mockOrganization);

      await (controller as any).createOrganization(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith(mockOrganization);
      expect(serviceMock.createOrganization).toHaveBeenCalledWith({
        name: "Salão Beleza",
        slug: "salao-beleza",
        description: "Salão completo",
        ownerId: "user-1",
      });
    });

    it("deve retornar 401 se usuário não autenticado", async () => {
      requestMock.user = undefined;

      await (controller as any).createOrganization(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "Não autenticado",
      });
    });

    it("deve passar ownerId do usuário autenticado", async () => {
      const mockOrg = {
        id: "org-1",
        ownerId: "user-123",
      };

      requestMock.user = { id: "user-123" };
      requestMock.body = {
        name: "My Org",
        slug: "my-org",
      };

      serviceMock.createOrganization.mockResolvedValue(mockOrg);

      await (controller as any).createOrganization(requestMock, replyMock);

      expect(serviceMock.createOrganization).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: "user-123",
        })
      );
    });
  });

  describe("inviteMember", () => {
    it("deve convidar membro com sucesso", async () => {
      const orgId = "550e8400-e29b-41d4-a716-446655440000";
      const mockInvite = {
        id: "invite-1",
        organizationId: orgId,
        email: "novomembro@test.com",
        role: "MEMBER",
        invitedBy: "user-1",
        status: "PENDING",
        expiresAt: new Date(),
      };

      requestMock.body = {
        organizationId: orgId,
        email: "novomembro@test.com",
        role: "member",
      };

      serviceMock.inviteMember.mockResolvedValue(mockInvite);

      await (controller as any).inviteMember(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith(mockInvite);
      expect(serviceMock.inviteMember).toHaveBeenCalledWith({
        organizationId: orgId,
        email: "novomembro@test.com",
        role: "MEMBER", // Convertido para maiúsculo
        invitedBy: "user-1",
      });
    });

    it("deve retornar 401 se usuário não autenticado", async () => {
      requestMock.user = undefined;

      await (controller as any).inviteMember(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "Não autenticado",
      });
    });

    it("deve converter role para maiúsculo", async () => {
      const orgId = "550e8400-e29b-41d4-a716-446655440000";
      const mockInvite = {
        id: "invite-1",
        role: "ADMIN",
      };

      requestMock.body = {
        organizationId: orgId,
        email: "admin@test.com",
        role: "admin",
      };

      serviceMock.inviteMember.mockResolvedValue(mockInvite);

      await (controller as any).inviteMember(requestMock, replyMock);

      expect(serviceMock.inviteMember).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "ADMIN",
        })
      );
    });

    it("deve passar invitedBy do usuário autenticado", async () => {
      const orgId = "550e8400-e29b-41d4-a716-446655440000";
      requestMock.user = { id: "admin-user" };
      requestMock.body = {
        organizationId: orgId,
        email: "test@test.com",
        role: "member",
      };

      serviceMock.inviteMember.mockResolvedValue({});

      await (controller as any).inviteMember(requestMock, replyMock);

      expect(serviceMock.inviteMember).toHaveBeenCalledWith(
        expect.objectContaining({
          invitedBy: "admin-user",
        })
      );
    });
  });

  describe("updateMemberRole", () => {
    it("deve atualizar role do membro com sucesso", async () => {
      const orgId = "550e8400-e29b-41d4-a716-446655440000";
      const memberId = "660e8400-e29b-41d4-a716-446655440001";
      const mockUpdatedMember = {
        id: memberId,
        organizationId: orgId,
        userId: "user-2",
        role: "ADMIN",
      };

      requestMock.body = {
        organizationId: orgId,
        memberId: memberId,
        role: "admin",
      };

      serviceMock.updateMemberRole.mockResolvedValue(mockUpdatedMember);

      await (controller as any).updateMemberRole(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith(mockUpdatedMember);
      expect(serviceMock.updateMemberRole).toHaveBeenCalledWith({
        organizationId: orgId,
        memberId: memberId,
        newRole: "ADMIN",
        updatedBy: "user-1",
      });
    });

    it("deve retornar 401 se usuário não autenticado", async () => {
      requestMock.user = undefined;

      await (controller as any).updateMemberRole(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "Não autenticado",
      });
    });

    it("deve converter role para maiúsculo", async () => {
      const orgId = "550e8400-e29b-41d4-a716-446655440000";
      const memberId = "660e8400-e29b-41d4-a716-446655440001";
      requestMock.body = {
        organizationId: orgId,
        memberId: memberId,
        role: "owner",
      };

      serviceMock.updateMemberRole.mockResolvedValue({});

      await (controller as any).updateMemberRole(requestMock, replyMock);

      expect(serviceMock.updateMemberRole).toHaveBeenCalledWith(
        expect.objectContaining({
          newRole: "OWNER",
        })
      );
    });

    it("deve passar updatedBy do usuário autenticado", async () => {
      const orgId = "550e8400-e29b-41d4-a716-446655440000";
      const memberId = "660e8400-e29b-41d4-a716-446655440001";
      requestMock.user = { id: "owner-user" };
      requestMock.body = {
        organizationId: orgId,
        memberId: memberId,
        role: "admin",
      };

      serviceMock.updateMemberRole.mockResolvedValue({});

      await (controller as any).updateMemberRole(requestMock, replyMock);

      expect(serviceMock.updateMemberRole).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedBy: "owner-user",
        })
      );
    });
  });

  describe("getMyOrganizations", () => {
    it("deve listar organizações do usuário com sucesso", async () => {
      const mockOrganizations = [
        {
          id: "org-1",
          name: "Org 1",
          slug: "org-1",
          description: "First org",
        },
        {
          id: "org-2",
          name: "Org 2",
          slug: "org-2",
          description: "Second org",
        },
      ];

      serviceMock.getUserOrganizations.mockResolvedValue(mockOrganizations);

      await (controller as any).getMyOrganizations(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith(mockOrganizations);
      expect(serviceMock.getUserOrganizations).toHaveBeenCalledWith("user-1");
    });

    it("deve retornar 401 se usuário não autenticado", async () => {
      requestMock.user = undefined;

      await (controller as any).getMyOrganizations(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "Não autenticado",
      });
    });

    it("deve retornar array vazio se usuário não tem organizações", async () => {
      serviceMock.getUserOrganizations.mockResolvedValue([]);

      await (controller as any).getMyOrganizations(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith([]);
    });

    it("deve usar ID do usuário autenticado", async () => {
      requestMock.user = { id: "specific-user-id" };

      serviceMock.getUserOrganizations.mockResolvedValue([]);

      await (controller as any).getMyOrganizations(requestMock, replyMock);

      expect(serviceMock.getUserOrganizations).toHaveBeenCalledWith(
        "specific-user-id"
      );
    });
  });
});
