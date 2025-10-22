/**
 * TDD - Testes para o componente Badge
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge Component", () => {
  it("deve renderizar badge com texto", () => {
    // Arrange & Act
    render(<Badge>Novo</Badge>);

    // Assert
    expect(screen.getByText("Novo")).toBeInTheDocument();
  });

  it("deve renderizar badge vazio", () => {
    // Arrange & Act
    render(<Badge></Badge>);

    // Assert
    expect(screen.getAllByRole("generic")[0]).toBeInTheDocument();
  });

  it("deve aceitar children como string", () => {
    // Arrange & Act
    render(<Badge>String Badge</Badge>);

    // Assert
    expect(screen.getByText("String Badge")).toBeInTheDocument();
  });

  it("deve aceitar children como elemento", () => {
    // Arrange & Act
    render(
      <Badge>
        <span>Element Badge</span>
      </Badge>
    );

    // Assert
    expect(screen.getByText("Element Badge")).toBeInTheDocument();
  });

  it("deve aceitar múltiplos children", () => {
    // Arrange & Act
    render(
      <Badge>
        <span>Badge</span>
        <span>2</span>
      </Badge>
    );

    // Assert
    expect(screen.getByText("Badge")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(<Badge className="custom-badge">Custom</Badge>);

    // Assert
    expect(screen.getByText("Custom")).toHaveClass("custom-badge");
  });

  it("deve renderizar badge com variante default", () => {
    // Arrange & Act
    render(<Badge>Default</Badge>);

    // Assert
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-primary");
  });

  it("deve renderizar badge com variante secondary", () => {
    // Arrange & Act
    render(<Badge variant="secondary">Secondary</Badge>);

    // Assert
    const badge = screen.getByText("Secondary");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-secondary");
  });

  it("deve renderizar badge com variante destructive", () => {
    // Arrange & Act
    render(<Badge variant="destructive">Destructive</Badge>);

    // Assert
    const badge = screen.getByText("Destructive");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-destructive");
  });

  it("deve renderizar badge com variante outline", () => {
    // Arrange & Act
    render(<Badge variant="outline">Outline</Badge>);

    // Assert
    const badge = screen.getByText("Outline");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("border");
  });
});
