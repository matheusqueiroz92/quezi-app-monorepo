import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { OrganizationService } from "../organization.service";
import { OrganizationRepository } from "../organization.repository";
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "../../../utils/app-error";

/**
 * TDD - Testes para OrganizationService
 */

jest.mock("../organization.repository");

describe("OrganizationService", () => {
  let organizationService: OrganizationService;
  let mockOrgRepository: jest.Mocked<OrganizationRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    organizationService = new OrganizationService();
    mockOrgRepository = (organizationService as any).organizationRepository;
  });

  describe("createOrganization", () => {
    const createData = {
      name: "Salão Beleza Total",
      slug: "salao-beleza-total",
      description: "Melhor salão da cidade",
      ownerId: "user-123",
    };

    it("deve criar organização e adicionar owner como membro", async () => {
      // Arrange
      const createdOrg = {
        id: "org-123",
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrgRepository.slugExists = jest.fn().mockResolvedValue(false);
      mockOrgRepository.create = jest.fn().mockResolvedValue(createdOrg);
      mockOrgRepository.addMember = jest.fn().mockResolvedValue({
        id: "member-123",
        organizationId: "org-123",
        userId: "user-123",
        role: "OWNER",
        createdAt: new Date(),
      });

      // Act
      const result = await organizationService.createOrganization(createData);

      // Assert
      expect(mockOrgRepository.slugExists).toHaveBeenCalledWith(
        createData.slug
      );
      expect(mockOrgRepository.create).toHaveBeenCalled();
      expect(mockOrgRepository.addMember).toHaveBeenCalledWith({
        organizationId: createdOrg.id,
        userId: createData.ownerId,
        role: "OWNER",
      });
      expect(result.name).toBe(createData.name);
    });

    it("deve lançar ConflictError se slug já existe", async () => {
      // Arrange
      mockOrgRepository.slugExists = jest.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(
        organizationService.createOrganization(createData)
      ).rejects.toThrow(ConflictError);
      expect(mockOrgRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("inviteMember", () => {
    const inviteData = {
      organizationId: "org-123",
      email: "novo@membro.com",
      role: "member" as const,
      invitedBy: "user-owner",
    };

    it("deve convidar membro com sucesso se for owner ou admin", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue("OWNER");
      mockOrgRepository.createInvite = jest.fn().mockResolvedValue({
        id: "invite-123",
        ...inviteData,
        status: "pending",
        createdAt: new Date(),
      });

      // Act
      const result = await organizationService.inviteMember(inviteData);

      // Assert
      expect(mockOrgRepository.getMemberRole).toHaveBeenCalledWith(
        inviteData.organizationId,
        inviteData.invitedBy
      );
      expect(mockOrgRepository.createInvite).toHaveBeenCalled();
      expect(result.email).toBe(inviteData.email);
    });

    it("deve lançar ForbiddenError se não for owner ou admin", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue("MEMBER");

      // Act & Assert
      await expect(
        organizationService.inviteMember(inviteData)
      ).rejects.toThrow(ForbiddenError);
      expect(mockOrgRepository.createInvite).not.toHaveBeenCalled();
    });

    it("deve lançar NotFoundError se usuário não pertence à org", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        organizationService.inviteMember(inviteData)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("updateMemberRole", () => {
    const updateData = {
      organizationId: "org-123",
      memberId: "member-456",
      newRole: "admin" as const,
      updatedBy: "user-owner",
    };

    it("deve atualizar role se for owner", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue("OWNER");
      mockOrgRepository.updateMemberRole = jest.fn().mockResolvedValue({
        id: "member-456",
        role: "ADMIN",
        updatedAt: new Date(),
      });

      // Act
      const result = await organizationService.updateMemberRole(updateData);

      // Assert
      expect(mockOrgRepository.getMemberRole).toHaveBeenCalledWith(
        updateData.organizationId,
        updateData.updatedBy
      );
      expect(mockOrgRepository.updateMemberRole).toHaveBeenCalled();
      expect(result.role).toBe("ADMIN");
    });

    it("deve lançar ForbiddenError se não for owner", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue("ADMIN");

      // Act & Assert
      await expect(
        organizationService.updateMemberRole(updateData)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("checkPermission", () => {
    it("deve retornar true se usuário tem permissão", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue("ADMIN");

      // Act
      const hasPermission = await organizationService.checkPermission(
        "org-123",
        "user-123",
        ["OWNER", "ADMIN"]
      );

      // Assert
      expect(hasPermission).toBe(true);
    });

    it("deve retornar false se usuário não tem permissão", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue("MEMBER");

      // Act
      const hasPermission = await organizationService.checkPermission(
        "org-123",
        "user-123",
        ["OWNER", "ADMIN"]
      );

      // Assert
      expect(hasPermission).toBe(false);
    });

    it("deve retornar false se usuário não pertence à org", async () => {
      // Arrange
      mockOrgRepository.getMemberRole = jest.fn().mockResolvedValue(null);

      // Act
      const hasPermission = await organizationService.checkPermission(
        "org-123",
        "user-123",
        ["OWNER"]
      );

      // Assert
      expect(hasPermission).toBe(false);
    });
  });
});
