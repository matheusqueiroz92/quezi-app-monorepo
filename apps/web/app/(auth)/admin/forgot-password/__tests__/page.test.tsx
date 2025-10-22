/**
 * TDD - Testes para Admin Forgot Password Page
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import AdminForgotPasswordPage from "../page";

// Mock do Next.js Router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock do useToast
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock da API
jest.mock("@/lib/api-client", () => ({
  post: jest.fn(),
  getErrorMessage: jest.fn(),
}));

describe("AdminForgotPasswordPage", () => {
  it("deve renderizar o formulário de recuperação de senha", () => {
    // Arrange & Act
    render(<AdminForgotPasswordPage />);

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });

  it("deve ter título da página", () => {
    // Arrange & Act
    render(<AdminForgotPasswordPage />);

    // Assert
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
  });

  it("deve ter link para voltar ao login", () => {
    // Arrange & Act
    render(<AdminForgotPasswordPage />);

    // Assert
    const backLink = screen.getByRole("link", { name: /voltar para login/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/admin/login");
  });

  it("deve ter descrição da página", () => {
    // Arrange & Act
    render(<AdminForgotPasswordPage />);

    // Assert
    expect(
      screen.getByText(/digite seu email e enviaremos um link/i)
    ).toBeInTheDocument();
  });
});
