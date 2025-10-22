/**
 * TDD - Testes para o hook useAuth
 * Framework: Jest + React Testing Library (oficial Next.js)
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuth } from "../use-auth";
import { api } from "@/lib/api";

// Mock da API
jest.mock("@/lib/api");

describe("useAuth Hook", () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("deve fazer login com credenciais válidas e armazenar token", async () => {
      // Arrange
      const mockResponse = {
        data: {
          user: {
            id: "user-123",
            email: "ana@teste.com",
            name: "Ana Silva",
            userType: "CLIENT",
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: "mock-token-123",
        },
      };

      mockApi.post.mockResolvedValueOnce(mockResponse);

      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.login("ana@teste.com", "SenhaForte123");
      });

      // Assert
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/auth/sign-in/email", {
          email: "ana@teste.com",
          password: "SenhaForte123",
        });
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "quezi_token",
          "mock-token-123"
        );
        expect(result.current.user).toEqual(mockResponse.data.user);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it("deve tratar erro de credenciais inválidas", async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            message: "Email ou senha inválidos",
          },
          status: 401,
        },
      };

      mockApi.post.mockRejectedValueOnce(mockError);

      // Act
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.login("ana@teste.com", "senhaerrada");
        } catch (error) {
          // Erro esperado
        }
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Email ou senha inválidos");
        expect(result.current.user).toBeNull();
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });

    it("deve tratar erro de rede", async () => {
      // Arrange
      const mockError = {
        message: "Network Error",
      };

      mockApi.post.mockRejectedValueOnce(mockError);

      // Act
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.login("ana@teste.com", "SenhaForte123");
        } catch (error) {
          // Erro esperado
        }
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe(
          "Erro ao fazer login. Tente novamente."
        );
      });
    });
  });

  describe("register", () => {
    it("deve registrar novo usuário com sucesso", async () => {
      // Arrange
      const mockResponse = {
        data: {
          user: {
            id: "user-456",
            email: "maria@teste.com",
            name: "Maria Santos",
            userType: "PROFESSIONAL",
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: "mock-token-456",
        },
      };

      mockApi.post.mockResolvedValueOnce(mockResponse);

      const registerData = {
        email: "maria@teste.com",
        password: "SenhaForte123",
        name: "Maria Santos",
        userType: "PROFESSIONAL" as const,
      };

      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.register(registerData);
      });

      // Assert
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          "/auth/sign-up/email",
          registerData
        );
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "quezi_token",
          "mock-token-456"
        );
        expect(result.current.user).toEqual(mockResponse.data.user);
      });
    });

    it("deve tratar erro de email já cadastrado", async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            message: "Email já cadastrado",
          },
          status: 409,
        },
      };

      mockApi.post.mockRejectedValueOnce(mockError);

      const registerData = {
        email: "duplicado@teste.com",
        password: "Senha123",
        name: "User Duplicado",
        userType: "CLIENT" as const,
      };

      // Act
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.register(registerData);
        } catch (error) {
          // Erro esperado
        }
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Email já cadastrado");
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });

    it("deve validar dados do formulário", async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            message: "Dados inválidos",
          },
          status: 400,
        },
      };

      mockApi.post.mockRejectedValueOnce(mockError);

      const invalidData = {
        email: "email-invalido",
        password: "123", // senha muito curta
        name: "Ab", // nome muito curto
        userType: "CLIENT" as const,
      };

      // Act
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.register(invalidData);
        } catch (error) {
          // Erro esperado
        }
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Dados inválidos");
      });
    });
  });

  describe("logout", () => {
    it("deve fazer logout e limpar token do localStorage", async () => {
      // Arrange
      mockApi.post.mockResolvedValueOnce({ data: { success: true } });
      localStorage.setItem("quezi_token", "mock-token-123");

      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.logout();
      });

      // Assert
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/auth/sign-out");
        expect(localStorage.removeItem).toHaveBeenCalledWith("quezi_token");
        expect(result.current.user).toBeNull();
      });
    });

    it("deve limpar token mesmo se a API falhar", async () => {
      // Arrange
      mockApi.post.mockRejectedValueOnce(new Error("Network error"));
      localStorage.setItem("quezi_token", "mock-token-123");

      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.logout();
      });

      // Assert
      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith("quezi_token");
        expect(result.current.user).toBeNull();
      });
    });
  });

  describe("getProfile", () => {
    it("deve buscar perfil do usuário autenticado", async () => {
      // Arrange
      const mockUser = {
        data: {
          id: "user-789",
          email: "perfil@teste.com",
          name: "Perfil User",
          userType: "CLIENT",
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockApi.get.mockResolvedValueOnce(mockUser);

      // Act
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.getProfile();
      });

      // Assert
      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith("/auth/me");
        expect(result.current.user).toEqual(mockUser.data);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("deve redirecionar para login se não autenticado", async () => {
      // Arrange
      const mockError = {
        response: {
          status: 401,
          data: {
            message: "Não autorizado",
          },
        },
      };

      mockApi.get.mockRejectedValueOnce(mockError);

      // Act
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.getProfile();
        } catch (error) {
          // Erro esperado
        }
      });

      // Assert
      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.error).toBe("Não autorizado");
      });
    });
  });

  describe("Estado inicial", () => {
    it("deve iniciar com estado correto", () => {
      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
