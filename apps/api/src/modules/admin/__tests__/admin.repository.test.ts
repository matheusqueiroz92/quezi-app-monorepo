import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AdminRepository } from "../admin.repository";
import { prisma } from "../../../lib/prisma";
import { AdminRole } from "@prisma/client";

// Mock do Prisma Client
jest.mock("../../../lib/prisma", () => ({
  prisma: {
    admin: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe("AdminRepository", () => {
  let repository: AdminRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AdminRepository();
  });

  describe("create", () => {
    it("deve criar um admin com sucesso", async () => {
      const input = {
        email: "admin@test.com",
        passwordHash: "hashed_password",
        name: "Test Admin",
        role: AdminRole.MODERATOR,
      };

      const mockAdmin = {
        id: "clx_admin_123",
        ...input,
        permissions: null,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.create.mockResolvedValueOnce(mockAdmin);

      const result = await repository.create(input);

      expect(result).toEqual(mockAdmin);
      expect(prismaMock.admin.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe("findById", () => {
    it("deve buscar admin por ID", async () => {
      const mockAdmin = {
        id: "clx_admin_123",
        email: "admin@test.com",
        passwordHash: "hashed",
        name: "Test Admin",
        role: AdminRole.MODERATOR,
        permissions: null,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.findUnique.mockResolvedValueOnce(mockAdmin);

      const result = await repository.findById("clx_admin_123");

      expect(result).toEqual(mockAdmin);
      expect(prismaMock.admin.findUnique).toHaveBeenCalledWith({
        where: { id: "clx_admin_123" },
      });
    });

    it("deve retornar null se admin não existir", async () => {
      prismaMock.admin.findUnique.mockResolvedValueOnce(null);

      const result = await repository.findById("non_existent_id");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("deve buscar admin por email", async () => {
      const mockAdmin = {
        id: "clx_admin_123",
        email: "admin@test.com",
        passwordHash: "hashed",
        name: "Test Admin",
        role: AdminRole.ADMIN,
        permissions: null,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.findUnique.mockResolvedValueOnce(mockAdmin);

      const result = await repository.findByEmail("admin@test.com");

      expect(result).toEqual(mockAdmin);
      expect(prismaMock.admin.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@test.com" },
      });
    });

    it("deve retornar null se email não existir", async () => {
      prismaMock.admin.findUnique.mockResolvedValueOnce(null);

      const result = await repository.findByEmail("nonexistent@test.com");

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    it("deve listar admins com paginação", async () => {
      const mockAdmins = [
        {
          id: "clx_admin_1",
          email: "admin1@test.com",
          passwordHash: "hashed",
          name: "Admin 1",
          role: AdminRole.MODERATOR,
          permissions: null,
          isActive: true,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "clx_admin_2",
          email: "admin2@test.com",
          passwordHash: "hashed",
          name: "Admin 2",
          role: AdminRole.ANALYST,
          permissions: null,
          isActive: true,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.admin.findMany.mockResolvedValueOnce(mockAdmins);
      prismaMock.admin.count.mockResolvedValueOnce(2);

      const result = await repository.findMany({ skip: 0, take: 10 });

      expect(result).toEqual(mockAdmins);
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: undefined,
        orderBy: undefined,
      });
    });

    it("deve filtrar por role", async () => {
      prismaMock.admin.findMany.mockResolvedValueOnce([]);

      await repository.findMany({
        skip: 0,
        take: 10,
        where: { role: AdminRole.SUPER_ADMIN },
      });

      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { role: AdminRole.SUPER_ADMIN },
        orderBy: undefined,
      });
    });
  });

  describe("count", () => {
    it("deve contar admins", async () => {
      prismaMock.admin.count.mockResolvedValueOnce(5);

      const result = await repository.count();

      expect(result).toBe(5);
    });

    it("deve contar com filtros", async () => {
      prismaMock.admin.count.mockResolvedValueOnce(2);

      const result = await repository.count({ role: AdminRole.MODERATOR });

      expect(result).toBe(2);
      expect(prismaMock.admin.count).toHaveBeenCalledWith({
        where: { role: AdminRole.MODERATOR },
      });
    });
  });

  describe("update", () => {
    it("deve atualizar admin com sucesso", async () => {
      const mockAdmin = {
        id: "clx_admin_123",
        email: "admin@test.com",
        passwordHash: "hashed",
        name: "Nome Atualizado",
        role: AdminRole.ADMIN,
        permissions: null,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.update.mockResolvedValueOnce(mockAdmin);

      const result = await repository.update("clx_admin_123", {
        name: "Nome Atualizado",
        role: AdminRole.ADMIN,
      });

      expect(result).toEqual(mockAdmin);
      expect(prismaMock.admin.update).toHaveBeenCalledWith({
        where: { id: "clx_admin_123" },
        data: { name: "Nome Atualizado", role: AdminRole.ADMIN },
      });
    });
  });

  describe("delete", () => {
    it("deve deletar admin com sucesso", async () => {
      prismaMock.admin.delete.mockResolvedValueOnce({
        id: "clx_admin_123",
        email: "admin@test.com",
        passwordHash: "hashed",
        name: "Test Admin",
        role: AdminRole.MODERATOR,
        permissions: null,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.delete("clx_admin_123");

      expect(prismaMock.admin.delete).toHaveBeenCalledWith({
        where: { id: "clx_admin_123" },
      });
    });
  });

  describe("emailExists", () => {
    it("deve retornar true se email existir", async () => {
      prismaMock.admin.findFirst.mockResolvedValueOnce({
        id: "clx_admin_123",
        email: "admin@test.com",
        passwordHash: "hashed",
        name: "Test Admin",
        role: AdminRole.MODERATOR,
        permissions: null,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.emailExists("admin@test.com");

      expect(result).toBe(true);
    });

    it("deve retornar false se email não existir", async () => {
      prismaMock.admin.findFirst.mockResolvedValueOnce(null);

      const result = await repository.emailExists("nonexistent@test.com");

      expect(result).toBe(false);
    });

    it("deve excluir ID específico ao verificar email", async () => {
      prismaMock.admin.findFirst.mockResolvedValueOnce(null);

      await repository.emailExists("admin@test.com", "clx_admin_123");

      expect(prismaMock.admin.findFirst).toHaveBeenCalledWith({
        where: {
          email: "admin@test.com",
          id: { not: "clx_admin_123" },
        },
      });
    });
  });

  describe("updatePassword", () => {
    it("deve atualizar senha do admin", async () => {
      const mockAdmin = {
        id: "clx_admin_123",
        email: "admin@test.com",
        passwordHash: "new_hashed_password",
        name: "Test Admin",
        role: AdminRole.MODERATOR,
        permissions: null,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.update.mockResolvedValueOnce(mockAdmin);

      const result = await repository.updatePassword(
        "clx_admin_123",
        "new_hashed_password"
      );

      expect(result).toEqual(mockAdmin);
      expect(prismaMock.admin.update).toHaveBeenCalledWith({
        where: { id: "clx_admin_123" },
        data: { passwordHash: "new_hashed_password" },
      });
    });
  });

  describe("updateLastLogin", () => {
    it("deve atualizar último login do admin", async () => {
      const now = new Date();
      const mockAdmin = {
        id: "clx_admin_123",
        email: "admin@test.com",
        passwordHash: "hashed",
        name: "Test Admin",
        role: AdminRole.MODERATOR,
        permissions: null,
        isActive: true,
        lastLogin: now,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.admin.update.mockResolvedValueOnce(mockAdmin);

      await repository.updateLastLogin("clx_admin_123");

      expect(prismaMock.admin.update).toHaveBeenCalledWith({
        where: { id: "clx_admin_123" },
        data: { lastLogin: expect.any(Date) },
      });
    });
  });

  describe("logAction", () => {
    it("deve registrar ação administrativa", async () => {
      const actionData = {
        adminId: "clx_admin_123",
        action: "USER_SUSPENDED",
        entityType: "User",
        entityId: "clx_user_456",
        details: { reason: "Violação dos termos" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      const mockAction = {
        id: "clx_action_789",
        ...actionData,
        createdAt: new Date(),
      };

      prismaMock.adminAction.create.mockResolvedValueOnce(mockAction);

      const result = await repository.logAction(actionData);

      expect(result).toEqual(mockAction);
      expect(prismaMock.adminAction.create).toHaveBeenCalledWith({
        data: actionData,
      });
    });
  });

  describe("getActions", () => {
    it("deve buscar ações com paginação", async () => {
      const mockActions = [
        {
          id: "clx_action_1",
          adminId: "clx_admin_123",
          action: "USER_SUSPENDED",
          entityType: "User",
          entityId: "clx_user_1",
          details: null,
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
        },
      ];

      prismaMock.adminAction.findMany.mockResolvedValueOnce(mockActions);

      const result = await repository.getActions({ skip: 0, take: 10 });

      expect(result).toEqual(mockActions);
      expect(prismaMock.adminAction.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: undefined,
        orderBy: { createdAt: "desc" },
        include: { admin: true },
      });
    });

    it("deve filtrar ações por adminId", async () => {
      prismaMock.adminAction.findMany.mockResolvedValueOnce([]);

      await repository.getActions({
        skip: 0,
        take: 10,
        where: { adminId: "clx_admin_123" },
      });

      expect(prismaMock.adminAction.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { adminId: "clx_admin_123" },
        orderBy: { createdAt: "desc" },
        include: { admin: true },
      });
    });
  });

  describe("countActions", () => {
    it("deve contar ações administrativas", async () => {
      prismaMock.adminAction.count.mockResolvedValueOnce(42);

      const result = await repository.countActions();

      expect(result).toBe(42);
    });

    it("deve contar com filtros", async () => {
      prismaMock.adminAction.count.mockResolvedValueOnce(10);

      const result = await repository.countActions({
        action: "USER_SUSPENDED",
      });

      expect(result).toBe(10);
      expect(prismaMock.adminAction.count).toHaveBeenCalledWith({
        where: { action: "USER_SUSPENDED" },
      });
    });
  });
});
