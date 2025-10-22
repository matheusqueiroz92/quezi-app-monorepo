/**
 * TDD - Testes para Verify Email Page
 * Framework: Jest + React Testing Library
 */

import { render, screen, waitFor } from "@testing-library/react";
import VerifyEmailPage from "../page";

// Mock do Next.js Router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => "test-token"),
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
  getErrorMessage: jest.fn(() => "Erro na verificação"),
}));

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar a página de verificação de email", () => {
    // Arrange & Act
    render(<VerifyEmailPage />);

    // Assert
    expect(screen.getByText(/verificando seu email/i)).toBeInTheDocument();
  });

  it("deve mostrar mensagem de verificação em andamento", () => {
    // Arrange & Act
    render(<VerifyEmailPage />);

    // Assert
    expect(
      screen.getByText(/por favor, aguarde enquanto confirmamos/i)
    ).toBeInTheDocument();
  });

  it("deve renderizar o logo", () => {
    // Arrange & Act
    render(<VerifyEmailPage />);

    // Assert
    expect(screen.getByText(/uezi/i)).toBeInTheDocument();
  });
});
