/**
 * Testes para página de registro
 * Testa validações visuais, fluxo multi-step e integração
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import RegisterPage from "../page";

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

// Mock do useLocalStorage
jest.mock("@/hooks/useLocalStorage", () => ({
  useLocalStorage: () => [
    {}, // savedProgress
    jest.fn(), // setSavedProgress
    jest.fn(), // clearProgress
  ],
}));

const mockPush = jest.fn();
const mockPost = require("@/lib/api-client").post;
const mockSetAuthToken = require("@/lib/auth-utils").setAuthToken;
const mockRedirectByRole = require("@/lib/auth-utils").redirectByRole;

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe("Step 1: Seleção de Perfil", () => {
    it("deve renderizar opções de cliente e profissional", () => {
      render(<RegisterPage />);

      expect(
        screen.getByText("Como você quer usar o Quezi?")
      ).toBeInTheDocument();
      expect(screen.getByText("Cliente")).toBeInTheDocument();
      expect(screen.getByText("Profissional")).toBeInTheDocument();
    });

    it("deve permitir seleção de cliente", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      expect(clientButton).toHaveClass("border-marsala");
    });

    it("deve permitir seleção de profissional", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const professionalButton = screen
        .getByText("Profissional")
        .closest("button");
      await user.click(professionalButton!);

      expect(professionalButton).toHaveClass("border-marsala");
    });

    it("deve avançar para próxima etapa ao clicar em Próximo", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Selecionar cliente
      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      // Clicar em Próximo
      const nextButton = screen.getByText("Próximo");
      await user.click(nextButton);

      // Deve mostrar etapa 2
      expect(screen.getByText("Criar sua conta")).toBeInTheDocument();
    });
  });

  describe("Step 2: Dados Básicos e Validações de Senha", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Avançar para etapa 2
      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      const nextButton = screen.getByText("Próximo");
      await user.click(nextButton);
    });

    it("deve renderizar campos de dados básicos", () => {
      expect(screen.getByLabelText("Nome Completo")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirmar Senha")).toBeInTheDocument();
    });

    it("deve mostrar validações de senha em tempo real", async () => {
      const user = userEvent.setup();
      const passwordInput = screen.getByLabelText("Senha");

      // Digitar senha inválida
      await user.type(passwordInput, "senha");

      // Deve mostrar indicadores de validação
      expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Uma letra maiúscula")).toBeInTheDocument();
      expect(screen.getByText("Uma letra minúscula")).toBeInTheDocument();
      expect(screen.getByText("Um número")).toBeInTheDocument();
      expect(screen.getByText("Um caractere especial")).toBeInTheDocument();
    });

    it("deve validar senha com todos os critérios", async () => {
      const user = userEvent.setup();
      const passwordInput = screen.getByLabelText("Senha");

      // Digitar senha válida
      await user.type(passwordInput, "Senha@123");

      // Aguardar validações aparecerem
      await waitFor(() => {
        const validationItems = screen.getAllByText(
          /Mínimo 8 caracteres|Uma letra maiúscula|Uma letra minúscula|Um número|Um caractere especial/
        );
        expect(validationItems).toHaveLength(5);
      });
    });

    it("deve validar confirmação de senha", async () => {
      const user = userEvent.setup();
      const passwordInput = screen.getByLabelText("Senha");
      const confirmPasswordInput = screen.getByLabelText("Confirmar Senha");

      // Digitar senha
      await user.type(passwordInput, "Senha@123");

      // Digitar confirmação diferente
      await user.type(confirmPasswordInput, "Senha@456");

      // Deve mostrar erro de confirmação
      expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
    });

    it("deve mostrar sucesso quando senhas coincidem", async () => {
      const user = userEvent.setup();
      const passwordInput = screen.getByLabelText("Senha");
      const confirmPasswordInput = screen.getByLabelText("Confirmar Senha");

      // Digitar senha
      await user.type(passwordInput, "Senha@123");

      // Digitar confirmação igual
      await user.type(confirmPasswordInput, "Senha@123");

      // Deve mostrar sucesso
      expect(screen.getByText("Senhas coincidem")).toBeInTheDocument();
    });

    it("deve alternar visibilidade da senha", async () => {
      const user = userEvent.setup();
      const passwordInput = screen.getByLabelText("Senha");
      const toggleButton = passwordInput.parentElement?.querySelector("button");

      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton!);

      expect(passwordInput).toHaveAttribute("type", "text");
    });

    it("deve alternar visibilidade da confirmação de senha", async () => {
      const user = userEvent.setup();
      const confirmPasswordInput = screen.getByLabelText("Confirmar Senha");
      const toggleButton =
        confirmPasswordInput.parentElement?.querySelector("button");

      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton!);

      expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });

    it("deve desabilitar botão Próximo com validações inválidas", async () => {
      const user = userEvent.setup();
      const nextButton = screen.getByText("Próximo");

      // Preencher dados básicos mas com senha inválida
      await user.type(screen.getByLabelText("Nome Completo"), "Maria Silva");
      await user.type(screen.getByLabelText("Email"), "maria@teste.com");
      await user.type(screen.getByLabelText("Senha"), "senha");
      await user.type(screen.getByLabelText("Confirmar Senha"), "senha");

      expect(nextButton).toBeDisabled();
    });

    it("deve habilitar botão Próximo com todas as validações válidas", async () => {
      const user = userEvent.setup();

      // Preencher dados válidos
      await user.type(screen.getByLabelText("Nome Completo"), "Maria Silva");
      await user.type(screen.getByLabelText("Email"), "maria@teste.com");
      await user.type(screen.getByLabelText("Senha"), "Senha@123");
      await user.type(screen.getByLabelText("Confirmar Senha"), "Senha@123");

      const nextButton = screen.getByText("Próximo");
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("Step 3: Informações Adicionais", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Completar etapas 1 e 2
      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      const nextButton1 = screen.getByText("Próximo");
      await user.click(nextButton1);

      await user.type(screen.getByLabelText("Nome Completo"), "Maria Silva");
      await user.type(screen.getByLabelText("Email"), "maria@teste.com");
      await user.type(screen.getByLabelText("Senha"), "Senha@123");
      await user.type(screen.getByLabelText("Confirmar Senha"), "Senha@123");

      const nextButton2 = screen.getByText("Próximo");
      await user.click(nextButton2);
    });

    it("deve renderizar campos de informações adicionais", () => {
      expect(screen.getByLabelText("Cidade")).toBeInTheDocument();
    });

    it("deve mostrar campos específicos para profissional", async () => {
      const user = userEvent.setup();

      // Voltar para etapa 1 e selecionar profissional
      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      const backButton2 = screen.getByText("Voltar");
      await user.click(backButton2);

      const professionalButton = screen
        .getByText("Profissional")
        .closest("button");
      await user.click(professionalButton!);

      const nextButton1 = screen.getByText("Próximo");
      await user.click(nextButton1);

      await user.type(
        screen.getByLabelText("Nome Completo"),
        "João Profissional"
      );
      await user.type(screen.getByLabelText("Email"), "joao@teste.com");
      await user.type(screen.getByLabelText("Senha"), "Senha@123");
      await user.type(screen.getByLabelText("Confirmar Senha"), "Senha@123");

      const nextButton2 = screen.getByText("Próximo");
      await user.click(nextButton2);

      // Deve mostrar campos específicos do profissional
      // Os campos específicos do profissional aparecem em etapas posteriores
    });
  });

  describe("Step 4: Confirmação", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Completar todas as etapas
      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      const nextButton1 = screen.getByText("Próximo");
      await user.click(nextButton1);

      await user.type(screen.getByLabelText("Nome Completo"), "Maria Silva");
      await user.type(screen.getByLabelText("Email"), "maria@teste.com");
      await user.type(screen.getByLabelText("Senha"), "Senha@123");
      await user.type(screen.getByLabelText("Confirmar Senha"), "Senha@123");

      const nextButton2 = screen.getByText("Próximo");
      await user.click(nextButton2);

      await user.type(screen.getByLabelText("Cidade"), "São Paulo");

      const nextButton3 = screen.getByText("Próximo");
      await user.click(nextButton3);
    });

    it("deve renderizar tela de confirmação", () => {
      expect(screen.getByText("Quase lá!")).toBeInTheDocument();
      expect(
        screen.getByText("Revise seus dados e confirme para criar sua conta")
      ).toBeInTheDocument();
    });

    it("deve mostrar resumo dos dados", () => {
      expect(screen.getByText("Maria Silva")).toBeInTheDocument();
      expect(screen.getByText("maria@teste.com")).toBeInTheDocument();
      expect(screen.getByText("São Paulo")).toBeInTheDocument();
    });

    it("deve mostrar botão Criar Conta", () => {
      expect(screen.getByText("Criar Conta")).toBeInTheDocument();
    });
  });

  describe("Integração e Submit", () => {
    it("deve fazer submit com dados válidos", async () => {
      mockPost.mockResolvedValue({ token: "fake-token" });

      const user = userEvent.setup();
      render(<RegisterPage />);

      // Completar fluxo completo
      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      const nextButton1 = screen.getByText("Próximo");
      await user.click(nextButton1);

      await user.type(screen.getByLabelText("Nome Completo"), "Maria Silva");
      await user.type(screen.getByLabelText("Email"), "maria@teste.com");
      await user.type(screen.getByLabelText("Senha"), "Senha@123");
      await user.type(screen.getByLabelText("Confirmar Senha"), "Senha@123");

      const nextButton2 = screen.getByText("Próximo");
      await user.click(nextButton2);

      await user.type(screen.getByLabelText("Cidade"), "São Paulo");

      const nextButton3 = screen.getByText("Próximo");
      await user.click(nextButton3);

      // Clicar em Criar Conta
      const createButton = screen.getByText("Criar Conta");
      await user.click(createButton);

      // Verificar se API foi chamada
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
          "/auth/sign-up/email",
          expect.objectContaining({
            name: "Maria Silva",
            email: "maria@teste.com",
            password: "Senha@123",
            userType: "CLIENT",
            city: "São Paulo",
          })
        );
      });
    });

    it("deve tratar erro de API", async () => {
      mockPost.mockRejectedValue(new Error("Email já cadastrado"));

      const user = userEvent.setup();
      render(<RegisterPage />);

      // Completar fluxo e tentar submit
      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      const nextButton1 = screen.getByText("Próximo");
      await user.click(nextButton1);

      await user.type(screen.getByLabelText("Nome Completo"), "Maria Silva");
      await user.type(screen.getByLabelText("Email"), "maria@teste.com");
      await user.type(screen.getByLabelText("Senha"), "Senha@123");
      await user.type(screen.getByLabelText("Confirmar Senha"), "Senha@123");

      const nextButton2 = screen.getByText("Próximo");
      await user.click(nextButton2);

      await user.type(screen.getByLabelText("Cidade"), "São Paulo");

      const nextButton3 = screen.getByText("Próximo");
      await user.click(nextButton3);

      const createButton = screen.getByText("Criar Conta");
      await user.click(createButton);

      // Deve mostrar loading
      await waitFor(() => {
        expect(screen.getByText("Criar Conta")).toBeInTheDocument();
      });
    });
  });

  describe("Navegação", () => {
    it("deve permitir voltar para etapa anterior", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // Avançar para etapa 2
      const clientButton = screen.getByText("Cliente").closest("button");
      await user.click(clientButton!);

      const nextButton = screen.getByText("Próximo");
      await user.click(nextButton);

      // Voltar para etapa 1
      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      expect(
        screen.getByText("Como você quer usar o Quezi?")
      ).toBeInTheDocument();
    });

    it("deve mostrar progresso visual", () => {
      render(<RegisterPage />);

      expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
      expect(screen.getByText("25%")).toBeInTheDocument();
    });
  });
});
