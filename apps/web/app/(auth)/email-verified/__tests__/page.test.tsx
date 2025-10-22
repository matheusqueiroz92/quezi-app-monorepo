/**
 * TDD - Testes para Email Verified Page
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import EmailVerifiedPage from "../page";

// Mock do Next.js Router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("EmailVerifiedPage", () => {
  it("deve renderizar a página de email verificado", () => {
    // Arrange & Act
    render(<EmailVerifiedPage />);

    // Assert
    expect(screen.getByText(/email verificado/i)).toBeInTheDocument();
  });

  it("deve mostrar mensagem de sucesso", () => {
    // Arrange & Act
    render(<EmailVerifiedPage />);

    // Assert
    expect(
      screen.getByText(/sua conta foi ativada com sucesso/i)
    ).toBeInTheDocument();
  });

  it("deve mostrar mensagem de boas-vindas", () => {
    // Arrange & Act
    render(<EmailVerifiedPage />);

    // Assert
    expect(
      screen.getByText(/agora você pode fazer login/i)
    ).toBeInTheDocument();
  });

  it("deve renderizar o logo", () => {
    // Arrange & Act
    render(<EmailVerifiedPage />);

    // Assert
    expect(screen.getAllByText(/quezi/i)[0]).toBeInTheDocument();
  });

  it("deve ter botão para ir ao login", () => {
    // Arrange & Act
    render(<EmailVerifiedPage />);

    // Assert
    const loginButton = screen.getByRole("button", { name: /fazer login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it("deve mostrar contador de redirecionamento", () => {
    // Arrange & Act
    render(<EmailVerifiedPage />);

    // Assert
    expect(
      screen.getByText(/redirecionando automaticamente/i)
    ).toBeInTheDocument();
  });

  it("deve mostrar mensagem de agradecimento", () => {
    // Arrange & Act
    render(<EmailVerifiedPage />);

    // Assert
    expect(screen.getByText(/bem-vinda à família quezi/i)).toBeInTheDocument();
  });
});
