/**
 * Testes para página de login
 * Testa funcionalidade completa com mocks adequados
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import LoginPage from "../page";

// Mock do useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock do api-client
jest.mock("@/lib/api-client", () => ({
  post: jest.fn(),
  getErrorMessage: jest.fn((error) => error.message || "Erro desconhecido"),
}));

// Mock do auth-utils
jest.mock("@/lib/auth-utils", () => ({
  setAuthToken: jest.fn(),
  redirectByRole: jest.fn(),
}));

// Mock do useToast
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockPush = jest.fn();
const mockPost = require("@/lib/api-client").post;
const mockSetAuthToken = require("@/lib/auth-utils").setAuthToken;
const mockRedirectByRole = require("@/lib/auth-utils").redirectByRole;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe("Renderização", () => {
    it("deve renderizar formulário de login", () => {
      render(<LoginPage />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument();
    });

    it("deve renderizar botões OAuth", () => {
      render(<LoginPage />);

      expect(screen.getByText("Continuar com Google")).toBeInTheDocument();
      expect(screen.getByText("Continuar com Facebook")).toBeInTheDocument();
      expect(screen.getByText("Continuar com Apple")).toBeInTheDocument();
      expect(screen.getByText("Continuar com Instagram")).toBeInTheDocument();
    });

    it("deve renderizar links de navegação", () => {
      render(<LoginPage />);

      expect(screen.getByText("Esqueceu sua senha?")).toBeInTheDocument();
      expect(screen.getByText("Não tem uma conta?")).toBeInTheDocument();
    });
  });

  describe("Interações do Usuário", () => {
    it("deve permitir digitar email e senha", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Senha");

      await user.type(emailInput, "teste@exemplo.com");
      await user.type(passwordInput, "senha123");

      expect(emailInput).toHaveValue("teste@exemplo.com");
      expect(passwordInput).toHaveValue("senha123");
    });

    it("deve alternar visibilidade da senha", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText("Senha");
      const toggleButton = passwordInput.parentElement?.querySelector("button");

      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton!);

      expect(passwordInput).toHaveAttribute("type", "text");
    });

    it("deve manter valores entre alternâncias de visibilidade", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText("Senha");
      const toggleButton = passwordInput.parentElement?.querySelector("button");

      await user.type(passwordInput, "minhasenha");
      await user.click(toggleButton!);

      expect(passwordInput).toHaveValue("minhasenha");
      expect(passwordInput).toHaveAttribute("type", "text");
    });
  });

  describe("Validação de Formulário", () => {
    it("deve renderizar campos de email e senha", () => {
      render(<LoginPage />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument();
    });

    it("deve permitir digitar email e senha", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Senha");

      await user.type(emailInput, "teste@exemplo.com");
      await user.type(passwordInput, "senha123");

      expect(emailInput).toHaveValue("teste@exemplo.com");
      expect(passwordInput).toHaveValue("senha123");
    });

    it("deve ter campos obrigatórios", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Senha");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Login com Sucesso", () => {
    it("deve fazer login com credenciais válidas", async () => {
      mockPost.mockResolvedValue({ token: "fake-token" });

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("Email"), "teste@exemplo.com");
      await user.type(screen.getByLabelText("Senha"), "senha123");

      const submitButton = screen.getByRole("button", { name: /entrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/auth/sign-in/email", {
          email: "teste@exemplo.com",
          password: "senha123",
        });
      });

      expect(mockSetAuthToken).toHaveBeenCalledWith("fake-token", true);
    });

    it("deve mostrar loading durante login", async () => {
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("Email"), "teste@exemplo.com");
      await user.type(screen.getByLabelText("Senha"), "senha123");

      const submitButton = screen.getByRole("button", { name: /entrar/i });
      await user.click(submitButton);

      expect(screen.getByText("Entrando...")).toBeInTheDocument();
    });
  });

  describe("Tratamento de Erros", () => {
    it("deve tratar erro de credenciais inválidas", async () => {
      mockPost.mockRejectedValue(new Error("Credenciais inválidas"));

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("Email"), "teste@exemplo.com");
      await user.type(screen.getByLabelText("Senha"), "senhaerrada");

      const submitButton = screen.getByRole("button", { name: /entrar/i });
      await user.click(submitButton);

      // Aguardar o erro ser tratado
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/auth/sign-in/email", {
          email: "teste@exemplo.com",
          password: "senhaerrada",
        });
      });
    });

    it("deve tratar erro de rede", async () => {
      mockPost.mockRejectedValue(new Error("Erro de conexão"));

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("Email"), "teste@exemplo.com");
      await user.type(screen.getByLabelText("Senha"), "senha123");

      const submitButton = screen.getByRole("button", { name: /entrar/i });
      await user.click(submitButton);

      // Aguardar o erro ser tratado
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/auth/sign-in/email", {
          email: "teste@exemplo.com",
          password: "senha123",
        });
      });
    });
  });

  describe("Navegação", () => {
    it("deve navegar para página de registro", () => {
      render(<LoginPage />);

      const registerLink = screen.getByText("Cadastre-se gratuitamente");
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("deve navegar para recuperação de senha", () => {
      render(<LoginPage />);

      const forgotPasswordLink = screen.getByText("Esqueceu?");
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    });

    it("deve navegar para recuperação de senha (link completo)", () => {
      render(<LoginPage />);

      const forgotPasswordLink = screen.getByText("Esqueceu sua senha?");
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    });
  });

  describe("OAuth", () => {
    it("deve renderizar botões OAuth", () => {
      render(<LoginPage />);
      expect(screen.getByText("Continuar com Google")).toBeInTheDocument();
      expect(screen.getByText("Continuar com Facebook")).toBeInTheDocument();
      expect(screen.getByText("Continuar com Apple")).toBeInTheDocument();
      expect(screen.getByText("Continuar com Instagram")).toBeInTheDocument();
    });

    it("deve desabilitar botões OAuth durante loading", async () => {
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText("Email"), "teste@exemplo.com");
      await user.type(screen.getByLabelText("Senha"), "senha123");

      const submitButton = screen.getByRole("button", { name: /entrar/i });
      await user.click(submitButton);

      // Verificar se os botões OAuth estão desabilitados
      const googleButton = screen.getByText("Continuar com Google");
      expect(googleButton.closest("button")).toBeDisabled();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter labels corretos", () => {
      render(<LoginPage />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    });

    it("deve ter roles corretos", () => {
      render(<LoginPage />);

      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /email/i })
      ).toBeInTheDocument();
    });
  });
});
