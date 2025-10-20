import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";

// Mock do service
jest.mock("../user.service");

describe("UserController", () => {
  let controller: UserController;
  let serviceMock: any;
  let requestMock: any;
  let replyMock: any;

  beforeEach(() => {
    // Criar mock do service
    serviceMock = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      listUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    // Mockar UserService constructor
    (UserService as jest.MockedClass<typeof UserService>).mockImplementation(
      () => serviceMock
    );

    controller = new UserController();

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

    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("deve criar usuário com sucesso", async () => {
      const mockUser = {
        id: "user-1",
        email: "teste@test.com",
        name: "Teste User",
        phone: "11999999999",
        userType: "CLIENT",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      requestMock.body = {
        email: "teste@test.com",
        password: "Senha123!",
        name: "Teste User",
        phone: "11999999999",
        userType: "CLIENT",
      };

      serviceMock.createUser.mockResolvedValue(mockUser);

      await (controller as any).createUser(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith(mockUser);
      expect(serviceMock.createUser).toHaveBeenCalledWith(requestMock.body);
    });

    it("deve criar usuário profissional", async () => {
      const mockUser = {
        id: "prof-1",
        email: "prof@test.com",
        name: "Profissional",
        userType: "PROFESSIONAL",
      };

      requestMock.body = {
        email: "prof@test.com",
        password: "Senha123!",
        name: "Profissional",
        userType: "PROFESSIONAL",
      };

      serviceMock.createUser.mockResolvedValue(mockUser);

      await (controller as any).createUser(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(serviceMock.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: "PROFESSIONAL",
        })
      );
    });
  });

  describe("getUserById", () => {
    it("deve buscar usuário por ID com sucesso", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      const mockUser = {
        id: userId,
        email: "user@test.com",
        name: "User Name",
        phone: null,
        userType: "CLIENT",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      requestMock.params = { id: userId };

      serviceMock.getUserById.mockResolvedValue(mockUser);

      await (controller as any).getUserById(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockUser);
      expect(serviceMock.getUserById).toHaveBeenCalledWith(userId);
    });

    it("deve buscar usuário com ID diferente", async () => {
      const userId = "660e8400-e29b-41d4-a716-446655440001";
      const mockUser = {
        id: userId,
        email: "test@test.com",
        name: "Test",
      };

      requestMock.params = { id: userId };

      serviceMock.getUserById.mockResolvedValue(mockUser);

      await (controller as any).getUserById(requestMock, replyMock);

      expect(serviceMock.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe("listUsers", () => {
    it("deve listar usuários com paginação padrão", async () => {
      const mockResponse = {
        data: [
          {
            id: "user-1",
            email: "user1@test.com",
            name: "User 1",
            userType: "CLIENT",
          },
          {
            id: "user-2",
            email: "user2@test.com",
            name: "User 2",
            userType: "PROFESSIONAL",
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      requestMock.query = {};

      serviceMock.listUsers.mockResolvedValue(mockResponse);

      await (controller as any).listUsers(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockResponse);
      expect(serviceMock.listUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("deve listar usuários com filtros customizados", async () => {
      const mockResponse = {
        data: [
          {
            id: "prof-1",
            name: "Professional",
            userType: "PROFESSIONAL",
          },
        ],
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          totalPages: 2,
        },
      };

      requestMock.query = {
        page: 2,
        limit: 5,
        userType: "PROFESSIONAL",
        search: "cabelo",
      };

      serviceMock.listUsers.mockResolvedValue(mockResponse);

      await (controller as any).listUsers(requestMock, replyMock);

      expect(serviceMock.listUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        userType: "PROFESSIONAL",
        search: "cabelo",
      });
    });
  });

  describe("updateUser", () => {
    it("deve atualizar usuário com sucesso", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      const mockUser = {
        id: userId,
        email: "updated@test.com",
        name: "Updated Name",
        phone: "11888888888",
      };

      requestMock.params = { id: userId };
      requestMock.body = {
        name: "Updated Name",
        phone: "11888888888",
      };

      serviceMock.updateUser.mockResolvedValue(mockUser);

      await (controller as any).updateUser(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockUser);
      expect(serviceMock.updateUser).toHaveBeenCalledWith(
        userId,
        requestMock.body
      );
    });

    it("deve permitir atualização parcial", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      const mockUser = {
        id: userId,
        name: "Apenas Nome Atualizado",
      };

      requestMock.params = { id: userId };
      requestMock.body = {
        name: "Apenas Nome Atualizado",
      };

      serviceMock.updateUser.mockResolvedValue(mockUser);

      await (controller as any).updateUser(requestMock, replyMock);

      expect(serviceMock.updateUser).toHaveBeenCalledWith(userId, {
        name: "Apenas Nome Atualizado",
      });
    });
  });

  describe("deleteUser", () => {
    it("deve deletar usuário com sucesso", async () => {
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      requestMock.params = { id: userId };

      serviceMock.deleteUser.mockResolvedValue(undefined);

      await (controller as any).deleteUser(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(204);
      expect(replyMock.send).toHaveBeenCalled();
      expect(serviceMock.deleteUser).toHaveBeenCalledWith(userId);
    });

    it("deve chamar deleteUser com ID correto", async () => {
      const userId = "660e8400-e29b-41d4-a716-446655440002";
      requestMock.params = { id: userId };

      serviceMock.deleteUser.mockResolvedValue(undefined);

      await (controller as any).deleteUser(requestMock, replyMock);

      expect(serviceMock.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
