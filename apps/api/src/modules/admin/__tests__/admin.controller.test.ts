import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from "@jest/globals";

// Mock dos schemas Zod ANTES de qualquer importação
const mockParse = jest.fn((data) => data);
jest.mock("../admin.schema", () => ({
  adminLoginSchema: { parse: mockParse },
  createAdminSchema: { parse: mockParse },
  updateAdminSchema: { parse: mockParse },
  updateAdminPasswordSchema: { parse: mockParse },
  adminIdSchema: { parse: mockParse },
  listAdminsQuerySchema: { parse: mockParse },
  userIdSchema: { parse: mockParse },
  suspendUserSchema: { parse: mockParse },
  getUsersQuerySchema: { parse: mockParse },
  getAdminActionsQuery: { parse: mockParse },
}));

// Mock dos services
jest.mock("../admin.service");
jest.mock("../../users/user.repository");

import { FastifyRequest, FastifyReply } from "fastify";
import { AdminController } from "../admin.controller";
import { AdminService } from "../admin.service";
import { UserRepository } from "../../users/user.repository";
import { AdminRole } from "@prisma/client";
import { AppError } from "../../../utils/app-error";

describe("AdminController", () => {
  let controller: AdminController;
  let mockAdminService: jest.Mocked<AdminService>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockAdmin = {
    id: "admin-1",
    email: "admin@test.com",
    name: "Admin Test",
    role: AdminRole.ADMIN,
    isActive: true,
    permissions: null,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockParse.mockClear();
    mockParse.mockImplementation((data) => data);

    mockAdminService = {
      login: jest.fn(),
      validateToken: jest.fn(),
      createAdmin: jest.fn(),
      listAdmins: jest.fn(),
      getAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      deleteAdmin: jest.fn(),
      changePassword: jest.fn(),
      suspendUser: jest.fn(),
      activateUser: jest.fn(),
      deleteUserPermanently: jest.fn(),
      getDashboardStats: jest.fn(),
      getUserStats: jest.fn(),
      hasPermission: jest.fn(),
      getAdminActions: jest.fn(),
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    (AdminService as jest.Mock).mockImplementation(() => mockAdminService);
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);

    controller = new AdminController();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {},
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("login", () => {
    it("deve fazer login com credenciais válidas", async () => {
      // Arrange
      const loginData = {
        email: "admin@test.com",
        password: "password123",
      };
      const loginResponse = {
        admin: mockAdmin,
        token: "jwt-token",
      };

      mockRequest.body = loginData;
      mockAdminService.login.mockResolvedValue(loginResponse);

      // Act
      await (controller as any).login(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(loginResponse);
    });

    it("deve tratar erro com statusCode", async () => {
      // Arrange
      const loginData = {
        email: "admin@test.com",
        password: "wrong-password",
      };
      const error = new AppError("Credenciais inválidas", 401);

      mockRequest.body = loginData;
      mockAdminService.login.mockRejectedValue(error);

      // Act
      await (controller as any).login(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Credenciais inválidas",
      });
    });

    it("deve tratar erro genérico", async () => {
      // Arrange
      const loginData = {
        email: "admin@test.com",
        password: "password123",
      };

      mockRequest.body = loginData;
      mockAdminService.login.mockRejectedValue(new Error("Database error"));

      // Act
      await (controller as any).login(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao fazer login",
      });
    });
  });

  describe("getSession", () => {
    it("deve retornar dados do admin autenticado", async () => {
      // Arrange
      const adminWithPassword = {
        ...mockAdmin,
        passwordHash: "hashed-password",
      };

      (mockRequest as any).admin = adminWithPassword;

      // Act
      await (controller as any).getSession(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        admin: expect.not.objectContaining({ passwordHash: expect.anything() }),
      });
    });

    it("deve tratar erro ao buscar sessão", async () => {
      // Arrange
      (mockRequest as any).admin = undefined;

      // Act
      await (controller as any).getSession(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao buscar sessão",
      });
    });
  });

  describe("createAdmin", () => {
    it("deve criar admin com sucesso", async () => {
      // Arrange
      const adminData = {
        email: "newadmin@test.com",
        password: "Password123",
        name: "New Admin",
        role: AdminRole.MODERATOR,
      };
      const createdAdmin = {
        id: "admin-2",
        ...adminData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = adminData;
      (mockRequest as any).admin = { id: "admin-1" };
      mockAdminService.createAdmin.mockResolvedValue(createdAdmin);

      // Act
      await (controller as any).createAdmin(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.createAdmin).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(createdAdmin);
    });

    it("deve tratar erro com statusCode", async () => {
      // Arrange
      const adminData = {
        email: "newadmin@test.com",
        password: "Password123",
        name: "New Admin",
        role: AdminRole.MODERATOR,
      };
      const error = new AppError("Email já existe", 409);

      mockRequest.body = adminData;
      (mockRequest as any).admin = { id: "admin-1" };
      mockAdminService.createAdmin.mockRejectedValue(error);

      // Act
      await (controller as any).createAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(409);
      expect(mockReply.send).toHaveBeenCalledWith({ error: "Email já existe" });
    });

    it("deve tratar erro genérico", async () => {
      // Arrange
      const adminData = {
        email: "newadmin@test.com",
        password: "Password123",
        name: "New Admin",
        role: AdminRole.MODERATOR,
      };

      mockRequest.body = adminData;
      (mockRequest as any).admin = { id: "admin-1" };
      mockAdminService.createAdmin.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).createAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao criar admin",
      });
    });
  });

  describe("listAdmins", () => {
    it("deve listar admins com sucesso", async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const response = {
        data: [mockAdmin],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockRequest.query = query;
      mockAdminService.listAdmins.mockResolvedValue(response);

      // Act
      await (controller as any).listAdmins(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.listAdmins).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(response);
    });

    it("deve tratar erros", async () => {
      // Arrange
      mockRequest.query = {};
      mockAdminService.listAdmins.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).listAdmins(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao listar admins",
      });
    });
  });

  describe("getDashboard", () => {
    it("deve retornar estatísticas do dashboard", async () => {
      // Arrange
      const stats = {
        totalUsers: 100,
        totalProfessionals: 50,
        totalClients: 50,
        activeUsers: 90,
      };

      mockAdminService.getDashboardStats.mockResolvedValue(stats);

      // Act
      await (controller as any).getDashboard(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.getDashboardStats).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(stats);
    });

    it("deve tratar erros", async () => {
      // Arrange
      mockAdminService.getDashboardStats.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).getDashboard(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao buscar estatísticas",
      });
    });
  });

  describe("getAdmin", () => {
    it("deve buscar admin por ID com sucesso", async () => {
      // Arrange
      mockRequest.params = { id: mockAdmin.id };
      mockAdminService.getAdmin.mockResolvedValue(mockAdmin);

      // Act
      await (controller as any).getAdmin(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.getAdmin).toHaveBeenCalledWith(mockAdmin.id);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(mockAdmin);
    });

    it("deve tratar erro com statusCode", async () => {
      // Arrange
      const error = new AppError("Admin não encontrado", 404);

      mockRequest.params = { id: "non-existent" };
      mockAdminService.getAdmin.mockRejectedValue(error);

      // Act
      await (controller as any).getAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Admin não encontrado",
      });
    });

    it("deve tratar erro genérico", async () => {
      // Arrange
      mockRequest.params = { id: mockAdmin.id };
      mockAdminService.getAdmin.mockRejectedValue(new Error("Database error"));

      // Act
      await (controller as any).getAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao buscar admin",
      });
    });
  });

  describe("updateAdmin", () => {
    it("deve atualizar admin com sucesso", async () => {
      // Arrange
      const updateData = { name: "Updated Name" };
      const updatedAdmin = { ...mockAdmin, ...updateData };

      mockRequest.params = { id: mockAdmin.id };
      mockRequest.body = updateData;
      (mockRequest as any).admin = { id: "super-admin-1" };
      mockAdminService.updateAdmin.mockResolvedValue(updatedAdmin);

      // Act
      await (controller as any).updateAdmin(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.updateAdmin).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(updatedAdmin);
    });

    it("deve tratar erro com statusCode", async () => {
      // Arrange
      const error = new AppError("Permissão negada", 403);

      mockRequest.params = { id: mockAdmin.id };
      mockRequest.body = { name: "New Name" };
      (mockRequest as any).admin = { id: "admin-1" };
      mockAdminService.updateAdmin.mockRejectedValue(error);

      // Act
      await (controller as any).updateAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Permissão negada",
      });
    });

    it("deve tratar erro genérico", async () => {
      // Arrange
      mockRequest.params = { id: mockAdmin.id };
      mockRequest.body = { name: "New Name" };
      (mockRequest as any).admin = { id: "super-admin-1" };
      mockAdminService.updateAdmin.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).updateAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao atualizar admin",
      });
    });
  });

  describe("deleteAdmin", () => {
    it("deve deletar admin com sucesso", async () => {
      // Arrange
      mockRequest.params = { id: mockAdmin.id };
      (mockRequest as any).admin = { id: "super-admin-1" };
      mockAdminService.deleteAdmin.mockResolvedValue(undefined);

      // Act
      await (controller as any).deleteAdmin(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.deleteAdmin).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it("deve tratar erro com statusCode", async () => {
      // Arrange
      const error = new AppError("Não pode deletar a si mesmo", 400);

      mockRequest.params = { id: mockAdmin.id };
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.deleteAdmin.mockRejectedValue(error);

      // Act
      await (controller as any).deleteAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Não pode deletar a si mesmo",
      });
    });

    it("deve tratar erro genérico", async () => {
      // Arrange
      mockRequest.params = { id: mockAdmin.id };
      (mockRequest as any).admin = { id: "super-admin-1" };
      mockAdminService.deleteAdmin.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).deleteAdmin(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao deletar admin",
      });
    });
  });

  describe("changePassword", () => {
    it("deve trocar senha com sucesso", async () => {
      // Arrange
      const passwordData = {
        currentPassword: "oldPassword",
        newPassword: "newPassword123",
      };

      mockRequest.params = { id: mockAdmin.id };
      mockRequest.body = passwordData;
      (mockRequest as any).admin = { id: mockAdmin.id, role: AdminRole.ADMIN };
      mockAdminService.changePassword.mockResolvedValue(undefined);

      // Act
      await (controller as any).changePassword(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.changePassword).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Senha atualizada com sucesso",
      });
    });

    it("deve permitir SUPER_ADMIN trocar senha de outros", async () => {
      // Arrange
      const passwordData = {
        currentPassword: "oldPassword",
        newPassword: "newPassword123",
      };

      mockRequest.params = { id: "other-admin-id" };
      mockRequest.body = passwordData;
      (mockRequest as any).admin = {
        id: "super-admin-1",
        role: AdminRole.SUPER_ADMIN,
      };
      mockAdminService.changePassword.mockResolvedValue(undefined);

      // Act
      await (controller as any).changePassword(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.changePassword).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
    });

    it("deve negar se admin tentar trocar senha de outro", async () => {
      // Arrange
      const passwordData = {
        currentPassword: "oldPassword",
        newPassword: "newPassword123",
      };

      mockRequest.params = { id: "other-admin" };
      mockRequest.body = passwordData;
      (mockRequest as any).admin = { id: mockAdmin.id, role: AdminRole.ADMIN };

      // Act
      await (controller as any).changePassword(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Você só pode trocar sua própria senha",
      });
      expect(mockAdminService.changePassword).not.toHaveBeenCalled();
    });

    it("deve tratar erro genérico", async () => {
      // Arrange
      const passwordData = {
        currentPassword: "oldPassword",
        newPassword: "newPassword123",
      };

      mockRequest.params = { id: mockAdmin.id };
      mockRequest.body = passwordData;
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.changePassword.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).changePassword(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao trocar senha",
      });
    });
  });

  describe("getUserDetails", () => {
    it("deve buscar detalhes do usuário", async () => {
      // Arrange
      const user = {
        id: "user-1",
        email: "user@test.com",
        name: "User Test",
        passwordHash: "hashed",
      };

      mockRequest.params = { id: user.id };
      mockUserRepository.findById.mockResolvedValue(user as any);

      // Act
      await (controller as any).getUserDetails(mockRequest, mockReply);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.not.objectContaining({ passwordHash: expect.anything() })
      );
    });

    it("deve retornar 404 se usuário não encontrado", async () => {
      // Arrange
      mockRequest.params = { id: "non-existent" };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      await (controller as any).getUserDetails(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Usuário não encontrado",
      });
    });

    it("deve tratar erros", async () => {
      // Arrange
      mockRequest.params = { id: "user-1" };
      mockUserRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).getUserDetails(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao buscar usuário",
      });
    });
  });

  describe("suspendUser", () => {
    it("deve suspender usuário com sucesso", async () => {
      // Arrange
      const suspendData = {
        reason: "Violação dos termos",
        permanent: false,
      };

      mockRequest.params = { id: "user-1" };
      mockRequest.body = suspendData;
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.suspendUser.mockResolvedValue(undefined);

      // Act
      await (controller as any).suspendUser(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.suspendUser).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Usuário suspenso com sucesso",
      });
    });

    it("deve tratar erro com statusCode", async () => {
      // Arrange
      const error = new AppError("Usuário não encontrado", 404);

      mockRequest.params = { id: "non-existent" };
      mockRequest.body = { reason: "Test", permanent: false };
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.suspendUser.mockRejectedValue(error);

      // Act
      await (controller as any).suspendUser(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Usuário não encontrado",
      });
    });

    it("deve tratar erro genérico", async () => {
      // Arrange
      mockRequest.params = { id: "user-1" };
      mockRequest.body = { reason: "Test", permanent: false };
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.suspendUser.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).suspendUser(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao suspender usuário",
      });
    });
  });

  describe("activateUser", () => {
    it("deve ativar usuário com sucesso", async () => {
      // Arrange
      mockRequest.params = { id: "user-1" };
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.activateUser.mockResolvedValue(undefined);

      // Act
      await (controller as any).activateUser(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.activateUser).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Usuário ativado com sucesso",
      });
    });

    it("deve tratar erro com statusCode", async () => {
      // Arrange
      const error = new AppError("Usuário não encontrado", 404);

      mockRequest.params = { id: "non-existent" };
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.activateUser.mockRejectedValue(error);

      // Act
      await (controller as any).activateUser(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Usuário não encontrado",
      });
    });

    it("deve tratar erros", async () => {
      // Arrange
      mockRequest.params = { id: "user-1" };
      (mockRequest as any).admin = { id: mockAdmin.id };
      mockAdminService.activateUser.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).activateUser(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao ativar usuário",
      });
    });
  });

  describe("getActions", () => {
    it("deve retornar log de ações", async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const actions = {
        data: [
          {
            id: "action-1",
            adminId: mockAdmin.id,
            action: "USER_SUSPENDED",
            entityType: "User",
            entityId: "user-1",
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockRequest.query = query;
      mockAdminService.getAdminActions.mockResolvedValue(actions);

      // Act
      await (controller as any).getActions(mockRequest, mockReply);

      // Assert
      expect(mockAdminService.getAdminActions).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(actions);
    });

    it("deve tratar erros", async () => {
      // Arrange
      mockRequest.query = {};
      mockAdminService.getAdminActions.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await (controller as any).getActions(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Erro ao buscar log de ações",
      });
    });
  });
});
