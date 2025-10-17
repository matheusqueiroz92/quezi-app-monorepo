/**
 * TDD - Testes para a página de Registro
 * Framework: Jest + React Testing Library (oficial Next.js)
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../page";
import { useAuth } from "@/hooks/use-auth";

// Mock do hook useAuth
jest.mock("@/hooks/use-auth");

describe("RegisterPage", () => {
  const mockRegister = jest.fn();
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      register: mockRegister,
      logout: jest.fn(),
      getProfile: jest.fn(),
      user: null,
      isLoading: false,
      error: null,
    });
  });

  describe("Renderização - Etapa 1 (Seleção de Tipo)", () => {
    it("deve renderizar o logo 'Quezi'", () => {
      render(<RegisterPage />);
      expect(
        screen.getByRole("heading", { name: /quezi/i })
      ).toBeInTheDocument();
    });

    it("deve renderizar o título 'Crie sua conta'", () => {
      render(<RegisterPage />);
      expect(
        screen.getByRole("heading", { name: /crie sua conta/i })
      ).toBeInTheDocument();
    });

    it("deve exibir descrição da etapa 1", () => {
      render(<RegisterPage />);
      expect(
        screen.getByText(/como você quer usar a quezi\?/i)
      ).toBeInTheDocument();
    });

    it("deve renderizar opção 'Sou Cliente'", () => {
      render(<RegisterPage />);
      expect(screen.getByText(/sou cliente/i)).toBeInTheDocument();
      expect(
        screen.getByText(/quero encontrar e agendar serviços/i)
      ).toBeInTheDocument();
    });

    it("deve renderizar opção 'Sou Profissional'", () => {
      render(<RegisterPage />);
      expect(screen.getByText(/sou profissional/i)).toBeInTheDocument();
      expect(
        screen.getByText(/quero oferecer meus serviços/i)
      ).toBeInTheDocument();
    });

    it("deve renderizar indicador de progresso", () => {
      render(<RegisterPage />);
      const progressBars = screen.getAllByRole("progressbar", { hidden: true });
      expect(progressBars).toHaveLength(2);
    });

    it("botão Continuar deve estar desabilitado inicialmente", () => {
      render(<RegisterPage />);
      const continueButton = screen.getByRole("button", { name: /continuar/i });
      expect(continueButton).toBeDisabled();
    });
  });

  describe("Interação - Etapa 1", () => {
    it("deve permitir selecionar 'Cliente' e habilitar botão Continuar", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const clientOption = screen.getByText(/sou cliente/i).closest("div");
      await user.click(clientOption!);

      const continueButton = screen.getByRole("button", { name: /continuar/i });
      expect(continueButton).not.toBeDisabled();
    });

    it("deve permitir selecionar 'Profissional' e habilitar botão Continuar", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const professionalOption = screen
        .getByText(/sou profissional/i)
        .closest("div");
      await user.click(professionalOption!);

      const continueButton = screen.getByRole("button", { name: /continuar/i });
      expect(continueButton).not.toBeDisabled();
    });

    it("deve exibir marcação visual ao selecionar tipo", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const clientOption = screen.getByText(/sou cliente/i).closest("div");
      await user.click(clientOption!);

      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("deve avançar para etapa 2 ao clicar em Continuar", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const professionalOption = screen
        .getByText(/sou profissional/i)
        .closest("div");
      await user.click(professionalOption!);

      const continueButton = screen.getByRole("button", { name: /continuar/i });
      await user.click(continueButton);

      await waitFor(() => {
        expect(
          screen.getByText(/preencha seus dados para começar/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Renderização - Etapa 2 (Dados Pessoais)", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Navegar para etapa 2
      const professionalOption = screen
        .getByText(/sou profissional/i)
        .closest("div");
      await user.click(professionalOption!);
      const continueButton = screen.getByRole("button", { name: /continuar/i });
      await user.click(continueButton);
    });

    it("deve renderizar campo de nome completo", () => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    it("deve renderizar campo de email", () => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("deve renderizar campo de senha", () => {
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    });

    it("deve renderizar requisitos de senha", () => {
      expect(screen.getByText(/a senha deve conter:/i)).toBeInTheDocument();
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/uma letra maiúscula/i)).toBeInTheDocument();
      expect(screen.getByText(/uma letra minúscula/i)).toBeInTheDocument();
      expect(screen.getByText(/um número/i)).toBeInTheDocument();
    });

    it("deve renderizar botões Voltar e Criar Conta", () => {
      expect(
        screen.getByRole("button", { name: /voltar/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /criar conta/i })
      ).toBeInTheDocument();
    });
  });

  describe("Validação do formulário - Etapa 2", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const clientOption = screen.getByText(/sou cliente/i).closest("div");
      await user.click(clientOption!);
      const continueButton = screen.getByRole("button", { name: /continuar/i });
      await user.click(continueButton);
    });

    it("deve mostrar erro para nome muito curto", async () => {
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const submitButton = screen.getByRole("button", { name: /criar conta/i });

      await user.type(nameInput, "Ab");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/nome deve ter no mínimo 3 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it("deve mostrar erro para email inválido", async () => {
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /criar conta/i });

      await user.type(emailInput, "email-invalido");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it("deve mostrar erro para senha sem letra maiúscula", async () => {
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText(/^senha$/i);
      const submitButton = screen.getByRole("button", { name: /criar conta/i });

      await user.type(passwordInput, "senhafraca123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/senha deve conter pelo menos uma letra maiúscula/i)
        ).toBeInTheDocument();
      });
    });

    it("deve mostrar erro para senha sem número", async () => {
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText(/^senha$/i);
      const submitButton = screen.getByRole("button", { name: /criar conta/i });

      await user.type(passwordInput, "SenhaFraca");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/senha deve conter pelo menos um número/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Submissão do formulário", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const professionalOption = screen
        .getByText(/sou profissional/i)
        .closest("div");
      await user.click(professionalOption!);
      const continueButton = screen.getByRole("button", { name: /continuar/i });
      await user.click(continueButton);
    });

    it("deve criar conta com dados válidos", async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce(undefined);

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const submitButton = screen.getByRole("button", { name: /criar conta/i });

      await user.type(nameInput, "Maria Santos");
      await user.type(emailInput, "maria@teste.com");
      await user.type(passwordInput, "SenhaForte123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: "Maria Santos",
          email: "maria@teste.com",
          password: "SenhaForte123",
          userType: "PROFESSIONAL",
        });
      });
    });

    it("deve exibir estado de loading durante registro", () => {
      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        register: mockRegister,
        logout: jest.fn(),
        getProfile: jest.fn(),
        user: null,
        isLoading: true,
        error: null,
      });

      render(<RegisterPage />);

      expect(screen.getByText(/criando conta\.\.\./i)).toBeInTheDocument();
    });

    it("deve exibir mensagem de erro da API", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const clientOption = screen.getByText(/sou cliente/i).closest("div");
      await user.click(clientOption!);
      const continueButton = screen.getByRole("button", { name: /continuar/i });
      await user.click(continueButton);

      mockUseAuth.mockReturnValue({
        login: jest.fn(),
        register: mockRegister,
        logout: jest.fn(),
        getProfile: jest.fn(),
        user: null,
        isLoading: false,
        error: "Email já cadastrado",
      });

      render(<RegisterPage />);

      await waitFor(() => {
        expect(screen.getByText(/email já cadastrado/i)).toBeInTheDocument();
      });
    });
  });

  describe("Navegação entre etapas", () => {
    it("deve voltar para etapa 1 ao clicar em Voltar", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Avançar para etapa 2
      const professionalOption = screen
        .getByText(/sou profissional/i)
        .closest("div");
      await user.click(professionalOption!);
      const continueButton = screen.getByRole("button", { name: /continuar/i });
      await user.click(continueButton);

      // Voltar para etapa 1
      const backButton = screen.getByRole("button", { name: /voltar/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(
          screen.getByText(/como você quer usar a quezi\?/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Interações do usuário", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const clientOption = screen.getByText(/sou cliente/i).closest("div");
      await user.click(clientOption!);
      const continueButton = screen.getByRole("button", { name: /continuar/i });
      await user.click(continueButton);
    });

    it("deve alternar visibilidade da senha", async () => {
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
      const toggleButton = screen.getByRole("button", { name: /👁️/ });

      expect(passwordInput.type).toBe("password");

      await user.click(toggleButton);
      expect(passwordInput.type).toBe("text");
    });
  });

  describe("Navegação", () => {
    it("deve ter link para página de login", () => {
      render(<RegisterPage />);

      const loginLink = screen.getByText(/faça login/i);
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });
});

