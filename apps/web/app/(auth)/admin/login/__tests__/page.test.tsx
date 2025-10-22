/**
 * TDD - Testes para Admin Login Page
 * Framework: Jest + React Testing Library
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLoginPage from "../page";

// Mock do Next.js Router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock do useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock da API
jest.mock("@/lib/api-client", () => ({
  post: jest.fn(),
  getErrorMessage: jest.fn(),
}));

// Mock do auth-utils
jest.mock("@/lib/auth-utils", () => ({
  setAuthToken: jest.fn(),
  redirectByRole: jest.fn(),
}));

describe("AdminLoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o formulário de login do admin", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("deve renderizar campos obrigatórios", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    expect(screen.getByPlaceholderText(/admin@quezi.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it("deve ter botão de toggle de senha", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    const toggleButton = screen.getByRole("button", { name: "" });
    expect(toggleButton).toBeInTheDocument();
  });

  it("deve ter link para recuperação de senha", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    const forgotPasswordLink = screen.getByRole("link", {
      name: /esqueci minha senha/i,
    });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute(
      "href",
      "/admin/forgot-password"
    );
  });

  it("deve ter link para voltar ao login normal", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    const backLink = screen.getByRole("link", {
      name: /fazer login como usuário/i,
    });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/login");
  });

  it("deve ter título da página", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    expect(screen.getByText(/painel administrativo/i)).toBeInTheDocument();
  });

  it("deve ter descrição da página", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    expect(
      screen.getByText(/acesso exclusivo para administradores/i)
    ).toBeInTheDocument();
  });

  it("deve ter aviso de segurança", () => {
    // Arrange & Act
    render(<AdminLoginPage />);

    // Assert
    expect(screen.getByText(/acesso restrito/i)).toBeInTheDocument();
  });
});
