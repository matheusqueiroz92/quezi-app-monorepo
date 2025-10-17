/**
 * TDD - Testes para a página de Login
 * Framework: Jest + React Testing Library (oficial Next.js)
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";
import { useAuth } from "@/hooks/use-auth";

// Mock do hook useAuth
jest.mock("@/hooks/use-auth");

describe("LoginPage", () => {
  const mockLogin = jest.fn();
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      getProfile: jest.fn(),
      user: null,
      isLoading: false,
      error: null,
    });
  });

  describe("Renderização", () => {
    it("deve renderizar o título 'Bem-vinda de volta!'", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("heading", { name: /bem-vinda de volta/i })
      ).toBeInTheDocument();
    });

    it("deve renderizar o logo 'Quezi'", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("heading", { name: /quezi/i })
      ).toBeInTheDocument();
    });

    it("deve renderizar campo de email", () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("deve renderizar campo de senha", () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    });

    it("deve renderizar botão de login", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("button", { name: /entrar/i })
      ).toBeInTheDocument();
    });

    it("deve renderizar link para esqueci senha", () => {
      render(<LoginPage />);
      expect(screen.getByText(/esqueceu\?/i)).toBeInTheDocument();
    });

    it("deve renderizar link para cadastro", () => {
      render(<LoginPage />);
      expect(
        screen.getByText(/cadastre-se gratuitamente/i)
      ).toBeInTheDocument();
    });

    it("deve renderizar botões de login social (Google e GitHub)", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("button", { name: /google/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /github/i })
      ).toBeInTheDocument();
    });
  });

  describe("Validação do formulário", () => {
    it("deve mostrar erro para email inválido", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /entrar/i });

      await user.type(emailInput, "email-invalido");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it("deve mostrar erro para senha muito curta", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole("button", { name: /entrar/i });

      await user.type(emailInput, "teste@example.com");
      await user.type(passwordInput, "123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/senha deve ter no mínimo 8 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it("não deve chamar login com dados inválidos", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const submitButton = screen.getByRole("button", { name: /entrar/i });
      await user.click(submitButton);

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("Submissão do formulário", () => {
    it("deve fazer login com credenciais válidas", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole("button", { name: /entrar/i });

      await user.type(emailInput, "ana@teste.com");
      await user.type(passwordInput, "SenhaForte123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          "ana@teste.com",
          "SenhaForte123"
        );
      });
    });

    it("deve exibir estado de loading durante login", async () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        register: jest.fn(),
        logout: jest.fn(),
        getProfile: jest.fn(),
        user: null,
        isLoading: true,
        error: null,
      });

      render(<LoginPage />);

      expect(screen.getByText(/entrando\.\.\./i)).toBeInTheDocument();
    });

    it("deve exibir mensagem de erro da API", () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        register: jest.fn(),
        logout: jest.fn(),
        getProfile: jest.fn(),
        user: null,
        isLoading: false,
        error: "Email ou senha inválidos",
      });

      render(<LoginPage />);

      expect(screen.getByText(/email ou senha inválidos/i)).toBeInTheDocument();
    });
  });

  describe("Interações do usuário", () => {
    it("deve alternar visibilidade da senha", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;
      const toggleButton = screen.getByRole("button", { name: /👁️/ });

      // Inicialmente tipo password
      expect(passwordInput.type).toBe("password");

      // Clicar para mostrar
      await user.click(toggleButton);
      expect(passwordInput.type).toBe("text");

      // Clicar para ocultar
      await user.click(toggleButton);
      expect(passwordInput.type).toBe("password");
    });
  });

  describe("Login Social", () => {
    it("deve redirecionar para Google OAuth ao clicar no botão", async () => {
      const user = userEvent.setup();
      delete (window as any).location;
      window.location = { href: "" } as any;

      render(<LoginPage />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      await user.click(googleButton);

      expect(window.location.href).toContain("/auth/signin/google");
    });

    it("deve redirecionar para GitHub OAuth ao clicar no botão", async () => {
      const user = userEvent.setup();
      delete (window as any).location;
      window.location = { href: "" } as any;

      render(<LoginPage />);

      const githubButton = screen.getByRole("button", { name: /github/i });
      await user.click(githubButton);

      expect(window.location.href).toContain("/auth/signin/github");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter labels associados aos inputs", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("deve desabilitar botão durante loading", () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        register: jest.fn(),
        logout: jest.fn(),
        getProfile: jest.fn(),
        user: null,
        isLoading: true,
        error: null,
      });

      render(<LoginPage />);

      const submitButton = screen.getByRole("button", { name: /entrando/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Navegação", () => {
    it("deve ter link para página de registro", () => {
      render(<LoginPage />);

      const registerLink = screen.getByText(/cadastre-se gratuitamente/i);
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("deve ter link para recuperação de senha", () => {
      render(<LoginPage />);

      const forgotLink = screen.getByText(/esqueceu\?/i);
      expect(forgotLink).toHaveAttribute("href", "/forgot-password");
    });
  });
});
