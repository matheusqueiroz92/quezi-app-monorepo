import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AdminService } from "../admin.service";
import { AdminRepository } from "../admin.repository";
import { UserRepository } from "../../users/user.repository";
import { hashPassword, verifyPassword } from "../../../utils/password";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from "../../../utils/app-error";
import { AdminRole } from "@prisma/client";
import * as jwt from "jsonwebtoken";

// Mocks
jest.mock("../admin.repository");
jest.mock("../../users/user.repository");
jest.mock("../../../utils/password");
jest.mock("jsonwebtoken");

describe("AdminService", () => {
  let service: AdminService;
  let adminRepositoryMock: jest.Mocked<AdminRepository>;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  const mockAdmin = {
    id: "admin-1",
    email: "admin@test.com",
    passwordHash: "hashed-password",
    name: "Admin Test",
    role: AdminRole.ADMIN,
    permissions: null,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSuperAdmin = {
    ...mockAdmin,
    id: "super-admin-1",
    email: "superadmin@test.com",
    role: AdminRole.SUPER_ADMIN,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    adminRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      emailExists: jest.fn(),
      updatePassword: jest.fn(),
      updateLastLogin: jest.fn(),
      logAction: jest.fn(),
      getActions: jest.fn(),
      countActions: jest.fn(),
    } as any;

    userRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    (AdminRepository as jest.Mock).mockImplementation(
      () => adminRepositoryMock
    );
    (UserRepository as jest.Mock).mockImplementation(() => userRepositoryMock);

    service = new AdminService();
  });

  describe("login", () => {
    it("deve fazer login com credenciais válidas", async () => {
      // Arrange
      const email = "admin@test.com";
      const password = "password123";
      const token = "jwt-token";

      adminRepositoryMock.findByEmail.mockResolvedValue(mockAdmin as any);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      adminRepositoryMock.updateLastLogin.mockResolvedValue(undefined);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      // Act
      const result = await service.login(email, password);

      // Assert
      expect(adminRepositoryMock.findByEmail).toHaveBeenCalledWith(email);
      expect(verifyPassword).toHaveBeenCalledWith(
        password,
        mockAdmin.passwordHash
      );
      expect(adminRepositoryMock.updateLastLogin).toHaveBeenCalledWith(
        mockAdmin.id
      );
      expect(result).toEqual({
        admin: expect.objectContaining({
          id: mockAdmin.id,
          email: mockAdmin.email,
          name: mockAdmin.name,
        }),
        token,
      });
      expect(result.admin).not.toHaveProperty("passwordHash");
    });

    it("deve lançar erro se admin não existir", async () => {
      // Arrange
      adminRepositoryMock.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login("invalid@test.com", "password")
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.login("invalid@test.com", "password")
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("deve lançar erro se admin estiver inativo", async () => {
      // Arrange
      const inactiveAdmin = { ...mockAdmin, isActive: false };
      adminRepositoryMock.findByEmail.mockResolvedValue(inactiveAdmin as any);

      // Act & Assert
      await expect(service.login("admin@test.com", "password")).rejects.toThrow(
        UnauthorizedError
      );
      await expect(service.login("admin@test.com", "password")).rejects.toThrow(
        "Admin inativo"
      );
    });

    it("deve lançar erro se senha incorreta", async () => {
      // Arrange
      adminRepositoryMock.findByEmail.mockResolvedValue(mockAdmin as any);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.login("admin@test.com", "wrong-password")
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.login("admin@test.com", "wrong-password")
      ).rejects.toThrow("Credenciais inválidas");
    });
  });

  describe("validateToken", () => {
    it("deve validar token válido", async () => {
      // Arrange
      const token = "valid-token";
      const decoded = { id: mockAdmin.id, type: "admin" };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);

      // Act
      const result = await service.validateToken(token);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(adminRepositoryMock.findById).toHaveBeenCalledWith(mockAdmin.id);
      expect(result).toEqual(mockAdmin);
    });

    it("deve lançar erro se tipo não for admin", async () => {
      // Arrange
      const token = "invalid-token";
      const decoded = { id: mockAdmin.id, type: "user" };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);

      // Act & Assert
      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(service.validateToken(token)).rejects.toThrow(
        "Token inválido ou expirado"
      );
    });

    it("deve lançar erro se admin não existir", async () => {
      // Arrange
      const token = "valid-token";
      const decoded = { id: "non-existent", type: "admin" };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      adminRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("deve lançar erro se admin estiver inativo", async () => {
      // Arrange
      const token = "valid-token";
      const decoded = { id: mockAdmin.id, type: "admin" };
      const inactiveAdmin = { ...mockAdmin, isActive: false };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      adminRepositoryMock.findById.mockResolvedValue(inactiveAdmin as any);

      // Act & Assert
      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("deve lançar erro se token for inválido", async () => {
      // Arrange
      const token = "invalid-token";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act & Assert
      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe("createAdmin", () => {
    const newAdminData = {
      email: "newadmin@test.com",
      password: "Password123",
      name: "New Admin",
      role: AdminRole.MODERATOR,
    };

    it("deve criar admin se requestor for SUPER_ADMIN", async () => {
      // Arrange
      const createdAdmin = {
        ...mockAdmin,
        ...newAdminData,
        id: "new-admin-1",
      };

      adminRepositoryMock.findById.mockResolvedValue(mockSuperAdmin as any);
      adminRepositoryMock.emailExists.mockResolvedValue(false);
      (hashPassword as jest.Mock).mockResolvedValue("hashed-password");
      adminRepositoryMock.create.mockResolvedValue(createdAdmin as any);
      adminRepositoryMock.logAction.mockResolvedValue(undefined);

      // Act
      const result = await service.createAdmin(newAdminData, mockSuperAdmin.id);

      // Assert
      expect(adminRepositoryMock.findById).toHaveBeenCalledWith(
        mockSuperAdmin.id
      );
      expect(adminRepositoryMock.emailExists).toHaveBeenCalledWith(
        newAdminData.email
      );
      expect(hashPassword).toHaveBeenCalledWith(newAdminData.password);
      expect(adminRepositoryMock.create).toHaveBeenCalled();
      expect(adminRepositoryMock.logAction).toHaveBeenCalled();
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("deve lançar erro se requestor não for SUPER_ADMIN", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);

      // Act & Assert
      await expect(
        service.createAdmin(newAdminData, mockAdmin.id)
      ).rejects.toThrow(ForbiddenError);
      await expect(
        service.createAdmin(newAdminData, mockAdmin.id)
      ).rejects.toThrow("Apenas SUPER_ADMIN pode criar novos administradores");
    });

    it("deve lançar erro se email já existir", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockSuperAdmin as any);
      adminRepositoryMock.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(
        service.createAdmin(newAdminData, mockSuperAdmin.id)
      ).rejects.toThrow(ConflictError);
      await expect(
        service.createAdmin(newAdminData, mockSuperAdmin.id)
      ).rejects.toThrow("Email já cadastrado");
    });

    it("deve lançar erro se requestor não existir", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createAdmin(newAdminData, "non-existent")
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getAdmin", () => {
    it("deve buscar admin por ID", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);

      // Act
      const result = await service.getAdmin(mockAdmin.id);

      // Assert
      expect(adminRepositoryMock.findById).toHaveBeenCalledWith(mockAdmin.id);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockAdmin.id,
          email: mockAdmin.email,
        })
      );
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("deve lançar erro se admin não existir", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getAdmin("non-existent")).rejects.toThrow(
        NotFoundError
      );
      await expect(service.getAdmin("non-existent")).rejects.toThrow("Admin");
    });
  });

  describe("listAdmins", () => {
    it("deve listar admins com paginação", async () => {
      // Arrange
      const params = { page: 1, limit: 10 };
      const admins = [mockAdmin, mockSuperAdmin];

      adminRepositoryMock.findMany.mockResolvedValue(admins as any);
      adminRepositoryMock.count.mockResolvedValue(2);

      // Act
      const result = await service.listAdmins(params);

      // Assert
      expect(adminRepositoryMock.findMany).toHaveBeenCalled();
      expect(adminRepositoryMock.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.not.objectContaining({ passwordHash: expect.anything() }),
        ]),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it("deve filtrar por role", async () => {
      // Arrange
      const params = { page: 1, limit: 10, role: AdminRole.SUPER_ADMIN };

      adminRepositoryMock.findMany.mockResolvedValue([mockSuperAdmin] as any);
      adminRepositoryMock.count.mockResolvedValue(1);

      // Act
      const result = await service.listAdmins(params);

      // Assert
      expect(adminRepositoryMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: AdminRole.SUPER_ADMIN }),
        })
      );
      expect(result.data).toHaveLength(1);
    });

    it("deve filtrar por isActive", async () => {
      // Arrange
      const params = { page: 1, limit: 10, isActive: true };

      adminRepositoryMock.findMany.mockResolvedValue([mockAdmin] as any);
      adminRepositoryMock.count.mockResolvedValue(1);

      // Act
      await service.listAdmins(params);

      // Assert
      expect(adminRepositoryMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it("deve buscar por nome ou email", async () => {
      // Arrange
      const params = { page: 1, limit: 10, search: "test" };

      adminRepositoryMock.findMany.mockResolvedValue([mockAdmin] as any);
      adminRepositoryMock.count.mockResolvedValue(1);

      // Act
      await service.listAdmins(params);

      // Assert
      expect(adminRepositoryMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        })
      );
    });
  });

  describe("updateAdmin", () => {
    const updateData = {
      name: "Updated Name",
      role: AdminRole.ADMIN,
    };

    it("deve atualizar admin se requestor for SUPER_ADMIN", async () => {
      // Arrange
      const updatedAdmin = { ...mockAdmin, ...updateData };

      adminRepositoryMock.findById
        .mockResolvedValueOnce(mockSuperAdmin as any)
        .mockResolvedValueOnce(mockAdmin as any);
      adminRepositoryMock.update.mockResolvedValue(updatedAdmin as any);
      adminRepositoryMock.logAction.mockResolvedValue(undefined);

      // Act
      const result = await service.updateAdmin(
        mockAdmin.id,
        updateData,
        mockSuperAdmin.id
      );

      // Assert
      expect(adminRepositoryMock.update).toHaveBeenCalledWith(
        mockAdmin.id,
        updateData
      );
      expect(adminRepositoryMock.logAction).toHaveBeenCalled();
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("deve lançar erro se requestor não for SUPER_ADMIN", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);

      // Act & Assert
      await expect(
        service.updateAdmin(mockAdmin.id, updateData, mockAdmin.id)
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar erro se admin não existir", async () => {
      // Arrange
      adminRepositoryMock.findById
        .mockResolvedValueOnce(mockSuperAdmin as any)
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateAdmin("non-existent", updateData, mockSuperAdmin.id)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteAdmin", () => {
    it("deve deletar admin se requestor for SUPER_ADMIN", async () => {
      // Arrange
      adminRepositoryMock.findById
        .mockResolvedValueOnce(mockSuperAdmin as any)
        .mockResolvedValueOnce(mockAdmin as any);
      adminRepositoryMock.delete.mockResolvedValue(undefined);
      adminRepositoryMock.logAction.mockResolvedValue(undefined);

      // Act
      await service.deleteAdmin(mockAdmin.id, mockSuperAdmin.id);

      // Assert
      expect(adminRepositoryMock.delete).toHaveBeenCalledWith(mockAdmin.id);
      expect(adminRepositoryMock.logAction).toHaveBeenCalled();
    });

    it("deve lançar erro se requestor não for SUPER_ADMIN", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);

      // Act & Assert
      await expect(
        service.deleteAdmin(mockAdmin.id, mockAdmin.id)
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar erro se tentar deletar a si mesmo", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockSuperAdmin as any);

      // Act & Assert
      await expect(
        service.deleteAdmin(mockSuperAdmin.id, mockSuperAdmin.id)
      ).rejects.toThrow(BadRequestError);
      await expect(
        service.deleteAdmin(mockSuperAdmin.id, mockSuperAdmin.id)
      ).rejects.toThrow("Você não pode deletar a si mesmo");
    });

    it("deve lançar erro se admin não existir", async () => {
      // Arrange
      adminRepositoryMock.findById
        .mockResolvedValueOnce(mockSuperAdmin as any)
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.deleteAdmin("non-existent", mockSuperAdmin.id)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("changePassword", () => {
    it("deve trocar senha com senha atual correta", async () => {
      // Arrange
      const currentPassword = "oldPassword123";
      const newPassword = "newPassword123";

      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue("new-hashed-password");
      adminRepositoryMock.updatePassword.mockResolvedValue(undefined);
      adminRepositoryMock.logAction.mockResolvedValue(undefined);

      // Act
      await service.changePassword(mockAdmin.id, currentPassword, newPassword);

      // Assert
      expect(verifyPassword).toHaveBeenCalledWith(
        currentPassword,
        mockAdmin.passwordHash
      );
      expect(hashPassword).toHaveBeenCalledWith(newPassword);
      expect(adminRepositoryMock.updatePassword).toHaveBeenCalledWith(
        mockAdmin.id,
        "new-hashed-password"
      );
      expect(adminRepositoryMock.logAction).toHaveBeenCalled();
    });

    it("deve lançar erro se senha atual incorreta", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.changePassword(mockAdmin.id, "wrong-password", "newPassword123")
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.changePassword(mockAdmin.id, "wrong-password", "newPassword123")
      ).rejects.toThrow("Senha atual incorreta");
    });

    it("deve lançar erro se admin não existir", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.changePassword("non-existent", "oldPass", "newPass")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("suspendUser", () => {
    const mockUser = {
      id: "user-1",
      email: "user@test.com",
      name: "Test User",
    };

    it("deve suspender usuário com sucesso", async () => {
      // Arrange
      userRepositoryMock.findById.mockResolvedValue(mockUser as any);
      userRepositoryMock.update.mockResolvedValue(mockUser as any);
      adminRepositoryMock.logAction.mockResolvedValue(undefined);

      // Act
      await service.suspendUser(
        mockUser.id,
        "Violação dos termos",
        false,
        undefined,
        mockAdmin.id
      );

      // Assert
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepositoryMock.update).toHaveBeenCalled();
      expect(adminRepositoryMock.logAction).toHaveBeenCalled();
    });

    it("deve lançar erro se usuário não existir", async () => {
      // Arrange
      userRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.suspendUser(
          "non-existent",
          "Motivo",
          false,
          undefined,
          mockAdmin.id
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("activateUser", () => {
    const mockUser = {
      id: "user-1",
      email: "user@test.com",
      name: "Test User",
    };

    it("deve ativar usuário com sucesso", async () => {
      // Arrange
      userRepositoryMock.findById.mockResolvedValue(mockUser as any);
      userRepositoryMock.update.mockResolvedValue(mockUser as any);
      adminRepositoryMock.logAction.mockResolvedValue(undefined);

      // Act
      await service.activateUser(mockUser.id, mockAdmin.id);

      // Assert
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepositoryMock.update).toHaveBeenCalled();
      expect(adminRepositoryMock.logAction).toHaveBeenCalled();
    });

    it("deve lançar erro se usuário não existir", async () => {
      // Arrange
      userRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.activateUser("non-existent", mockAdmin.id)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteUserPermanently", () => {
    const mockUser = {
      id: "user-1",
      email: "user@test.com",
      name: "Test User",
    };

    it("deve deletar usuário permanentemente", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockSuperAdmin as any);
      userRepositoryMock.findById.mockResolvedValue(mockUser as any);
      userRepositoryMock.delete.mockResolvedValue(undefined);
      adminRepositoryMock.logAction.mockResolvedValue(undefined);

      // Act
      await service.deleteUserPermanently(mockUser.id, mockSuperAdmin.id);

      // Assert
      expect(adminRepositoryMock.findById).toHaveBeenCalledWith(
        mockSuperAdmin.id
      );
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepositoryMock.delete).toHaveBeenCalledWith(mockUser.id);
      expect(adminRepositoryMock.logAction).toHaveBeenCalled();
    });

    it("deve lançar erro se requestor não for SUPER_ADMIN", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockAdmin as any);

      // Act & Assert
      await expect(
        service.deleteUserPermanently("user-1", mockAdmin.id)
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar erro se usuário não existir", async () => {
      // Arrange
      adminRepositoryMock.findById.mockResolvedValue(mockSuperAdmin as any);
      userRepositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteUserPermanently("non-existent", mockSuperAdmin.id)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("hasPermission", () => {
    it("deve retornar true para SUPER_ADMIN sempre", async () => {
      // Act
      const result = service.hasPermission(
        mockSuperAdmin as any,
        "ANY_PERMISSION"
      );

      // Assert
      expect(result).toBe(true);
    });

    it("deve verificar permissões padrão por role", async () => {
      // Act
      const resultAdmin = service.hasPermission(mockAdmin as any, "users.view");
      const resultModerator = service.hasPermission(
        { ...mockAdmin, role: AdminRole.MODERATOR } as any,
        "content.moderate"
      );

      // Assert
      expect(resultAdmin).toBe(true);
      expect(resultModerator).toBe(true);
    });

    it("deve verificar permissões customizadas", async () => {
      // Arrange
      const adminWithCustomPerms = {
        ...mockAdmin,
        permissions: { custom: { permission: true } },
      };

      // Act
      const result = service.hasPermission(
        adminWithCustomPerms as any,
        "custom.permission"
      );

      // Assert
      expect(result).toBe(true);
    });

    it("deve retornar false se não tiver permissão", async () => {
      // Act
      const result = service.hasPermission(
        { ...mockAdmin, role: AdminRole.ANALYST } as any,
        "users.suspend"
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getDashboardStats", () => {
    it("deve retornar estatísticas do dashboard", async () => {
      // Arrange
      userRepositoryMock.count.mockResolvedValue(100);

      // Act
      const result = await service.getDashboardStats();

      // Assert
      expect(result).toEqual({
        users: {
          total: 100,
          clients: 100,
          professionals: 100,
          newToday: 100,
        },
        appointments: {
          total: 0,
          pending: 0,
          completed: 0,
          completionRate: 0,
        },
        reviews: {
          total: 0,
          averageRating: 0,
          reportedPending: 0,
        },
        revenue: {
          total: 0,
          commission: 0,
          today: 0,
        },
      });
      expect(userRepositoryMock.count).toHaveBeenCalled();
    });
  });

  describe("getUserStats", () => {
    it("deve retornar estatísticas de usuários por período", async () => {
      // Arrange
      const period = "month";
      const userType = "CLIENT";

      userRepositoryMock.count.mockResolvedValue(0);

      // Act
      const result = await service.getUserStats(period, userType);

      // Assert
      expect(result).toEqual({
        period: "month",
        userType: "CLIENT",
        newUsers: 0,
        totalUsers: 0,
        growthRate: 0,
      });
      expect(userRepositoryMock.count).toHaveBeenCalled();
    });
  });

  describe("getAdminActions", () => {
    it("deve retornar ações administrativas", async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const actions = [
        {
          id: "action-1",
          adminId: mockAdmin.id,
          action: "USER_SUSPENDED",
          entityType: "User",
          entityId: "user-1",
          details: {},
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
        },
      ];

      adminRepositoryMock.getActions.mockResolvedValue(actions as any);
      adminRepositoryMock.countActions.mockResolvedValue(1);

      // Act
      const result = await service.getAdminActions(query);

      // Assert
      expect(result).toEqual({
        data: actions,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(adminRepositoryMock.getActions).toHaveBeenCalled();
      expect(adminRepositoryMock.countActions).toHaveBeenCalled();
    });

    it("deve filtrar ações por adminId", async () => {
      // Arrange
      const query = { page: 1, limit: 10, adminId: mockAdmin.id };

      adminRepositoryMock.getActions.mockResolvedValue([] as any);
      adminRepositoryMock.countActions.mockResolvedValue(0);

      // Act
      await service.getAdminActions(query);

      // Assert
      expect(adminRepositoryMock.getActions).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ adminId: mockAdmin.id }),
        })
      );
    });
  });
});
