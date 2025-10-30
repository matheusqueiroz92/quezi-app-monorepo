/**
 * Testes para AdminService
 *
 * Testa a lógica de negócio do sistema de administração
 * Seguindo TDD e princípios SOLID
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { AdminService } from "../admin.service";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock do UserRepository
const mockUserRepository = {
  findById: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByEmail: jest.fn(),
  findByUserType: jest.fn(),
  searchUsers: jest.fn(),
};

// Mock do AdminRepository
const mockAdminRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  emailExists: jest.fn(),
  updatePassword: jest.fn(),
  updateLastLogin: jest.fn(),
  logAction: jest.fn(),
  getActions: jest.fn(),
  countActions: jest.fn(),
  listAdmins: jest.fn(),
};

jest.mock("../../../infrastructure/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

jest.mock("../../../infrastructure/repositories/admin.repository", () => ({
  AdminRepository: jest.fn().mockImplementation(() => mockAdminRepository),
}));

describe("AdminService", () => {
  let adminService: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    adminService = new AdminService(mockAdminRepository, mockUserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getDashboardStats", () => {
    it("deve retornar estatísticas do dashboard", async () => {
      // Arrange
      const mockUsers = {
        data: [
          { id: "user-1", userType: "CLIENT" },
          { id: "user-2", userType: "PROFESSIONAL" },
          { id: "user-3", userType: "COMPANY" },
        ],
        total: 3,
        page: 1,
        limit: 10,
      };
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await adminService.getDashboardStats();

      // Assert
      expect(result).toEqual({
        users: {
          total: 0,
          clients: 0,
          professionals: 0,
          newToday: 0,
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
          today: 0,
          commission: 0,
        },
      });
    });
  });

  describe("getUsers", () => {
    it("deve listar usuários com paginação", async () => {
      // Arrange
      const filters = {
        search: "test",
        userType: "CLIENT" as const,
        page: 1,
        limit: 10,
      };
      const mockUsers = {
        data: [
          { id: "user-1", email: "test1@example.com", userType: "CLIENT" },
          { id: "user-2", email: "test2@example.com", userType: "CLIENT" },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await adminService.getUsers(filters);

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findMany).toHaveBeenCalledWith(filters);
    });

    it("deve listar todos os usuários sem filtros", async () => {
      // Arrange
      const filters = { page: 1, limit: 10 };
      const mockUsers = {
        data: [
          { id: "user-1", email: "user1@example.com", userType: "CLIENT" },
          {
            id: "user-2",
            email: "user2@example.com",
            userType: "PROFESSIONAL",
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await adminService.getUsers(filters);

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findMany).toHaveBeenCalledWith(filters);
    });
  });

  describe("getUserById", () => {
    it("deve retornar usuário por ID", async () => {
      // Arrange
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        userType: "CLIENT",
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await adminService.getUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "non-existent";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(adminService.getUserById(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateUser", () => {
    it("deve atualizar usuário com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = { name: "Updated Name" };
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Updated Name",
        userType: "CLIENT",
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(mockUser);

      // Act
      const result = await adminService.updateUser(userId, updateData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        updateData
      );
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "non-existent";
      const updateData = { name: "Updated Name" };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(adminService.updateUser(userId, updateData)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("deleteUser", () => {
    it("deve deletar usuário com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        userType: "CLIENT",
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      // Act
      const result = await adminService.deleteUser(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "non-existent";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(adminService.deleteUser(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("createUser", () => {
    it("deve criar usuário com sucesso", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        userType: "CLIENT" as const,
      };
      const mockUser = {
        id: "user-123",
        ...userData,
      };
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await adminService.createUser(userData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });

    it("deve lançar erro se dados forem inválidos", async () => {
      // Arrange
      const userData = {
        email: "invalid-email",
        password: "123",
        name: "",
        userType: "INVALID" as any,
      };
      mockUserRepository.create.mockRejectedValue(
        new BadRequestError("Dados inválidos")
      );

      // Act & Assert
      await expect(adminService.createUser(userData)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("getAdmins", () => {
    it("deve listar administradores", async () => {
      // Arrange
      const filters = { page: 1, limit: 10 };
      const mockAdmins = {
        data: [
          {
            id: "admin-1",
            email: "admin1@example.com",
            name: "Admin 1",
            role: "SUPER_ADMIN",
          },
          {
            id: "admin-2",
            email: "admin2@example.com",
            name: "Admin 2",
            role: "ADMIN",
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };
      mockAdminRepository.findMany.mockResolvedValue(mockAdmins);

      // Act
      const result = await adminService.getAdmins(filters);

      // Assert
      expect(result).toEqual(mockAdmins);
      expect(mockAdminRepository.findMany).toHaveBeenCalledWith(filters);
    });
  });

  describe("getAdminById", () => {
    it("deve retornar administrador por ID", async () => {
      // Arrange
      const adminId = "admin-123";
      const mockAdmin = {
        id: adminId,
        email: "admin@example.com",
        name: "Admin User",
        role: "SUPER_ADMIN",
      };
      mockAdminRepository.findById.mockResolvedValue(mockAdmin);

      // Act
      const result = await adminService.getAdminById(adminId);

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(mockAdminRepository.findById).toHaveBeenCalledWith(adminId);
    });

    it("deve lançar erro se administrador não encontrado", async () => {
      // Arrange
      const adminId = "non-existent";
      mockAdminRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(adminService.getAdminById(adminId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateAdmin", () => {
    it("deve atualizar administrador com sucesso", async () => {
      // Arrange
      const adminId = "admin-123";
      const requestingAdminId = "super-admin-123";
      const updateData = { name: "Updated Admin" };
      const mockAdmin = {
        id: adminId,
        email: "admin@example.com",
        name: "Updated Admin",
        role: "SUPER_ADMIN",
      };
      const mockRequestingAdmin = {
        id: requestingAdminId,
        email: "super@test.com",
        role: "SUPER_ADMIN",
        isActive: true,
      };

      mockAdminRepository.findById.mockResolvedValueOnce(mockRequestingAdmin);
      mockAdminRepository.findById.mockResolvedValue(mockAdmin);
      mockAdminRepository.update.mockResolvedValue(mockAdmin);

      // Act
      const result = await adminService.updateAdmin(
        adminId,
        updateData,
        requestingAdminId
      );

      // Assert
      expect(result).toEqual(mockAdmin);
      expect(mockAdminRepository.findById).toHaveBeenCalledWith(
        requestingAdminId
      );
      expect(mockAdminRepository.findById).toHaveBeenCalledWith(adminId);
      expect(mockAdminRepository.update).toHaveBeenCalledWith(
        adminId,
        updateData
      );
    });

    it("deve lançar erro se administrador não encontrado", async () => {
      // Arrange
      const adminId = "non-existent";
      const requestingAdminId = "super-admin-123";
      const updateData = { name: "Updated Admin" };
      const mockRequestingAdmin = {
        id: requestingAdminId,
        email: "super@test.com",
        role: "SUPER_ADMIN",
        isActive: true,
      };

      mockAdminRepository.findById.mockResolvedValueOnce(mockRequestingAdmin);
      mockAdminRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        adminService.updateAdmin(adminId, updateData, requestingAdminId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteAdmin", () => {
    it("deve deletar administrador com sucesso", async () => {
      // Arrange
      const adminId = "admin-123";
      const requestingAdminId = "super-admin-123";
      const mockAdmin = {
        id: adminId,
        email: "admin@example.com",
        name: "Admin User",
        role: "SUPER_ADMIN",
      };
      const mockRequestingAdmin = {
        id: requestingAdminId,
        email: "super@test.com",
        role: "SUPER_ADMIN",
        isActive: true,
      };

      mockAdminRepository.findByEmail.mockResolvedValueOnce(
        mockRequestingAdmin
      );
      mockAdminRepository.findById.mockResolvedValue(mockAdmin);
      mockAdminRepository.delete.mockResolvedValue(true);

      // Act
      const result = await adminService.deleteAdmin(adminId, requestingAdminId);

      // Assert
      expect(result).toBeUndefined();
      expect(mockAdminRepository.findByEmail).toHaveBeenCalledWith(
        requestingAdminId
      );
      expect(mockAdminRepository.findById).toHaveBeenCalledWith(adminId);
      expect(mockAdminRepository.delete).toHaveBeenCalledWith(adminId);
    });

    it("deve lançar erro se administrador não encontrado", async () => {
      // Arrange
      const adminId = "non-existent";
      const requestingAdminId = "super-admin-123";
      const mockRequestingAdmin = {
        id: requestingAdminId,
        email: "super@test.com",
        role: "SUPER_ADMIN",
        isActive: true,
      };

      mockAdminRepository.findByEmail.mockResolvedValueOnce(
        mockRequestingAdmin
      );
      mockAdminRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        adminService.deleteAdmin(adminId, requestingAdminId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
