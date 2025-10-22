/**
 * TDD - Testes para o componente Label
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import { Label } from "../label";

describe("Label Component", () => {
  it("deve renderizar label com texto", () => {
    // Arrange & Act
    render(<Label>Nome do campo</Label>);

    // Assert
    expect(screen.getByText("Nome do campo")).toBeInTheDocument();
  });

  it("deve renderizar label vazio", () => {
    // Arrange & Act
    render(<Label></Label>);

    // Assert
    expect(screen.getByRole("generic")).toBeInTheDocument();
  });

  it("deve aceitar children como string", () => {
    // Arrange & Act
    render(<Label>String Label</Label>);

    // Assert
    expect(screen.getByText("String Label")).toBeInTheDocument();
  });

  it("deve aceitar children como elemento", () => {
    // Arrange & Act
    render(
      <Label>
        <span>Element Label</span>
      </Label>
    );

    // Assert
    expect(screen.getByText("Element Label")).toBeInTheDocument();
  });

  it("deve aceitar múltiplos children", () => {
    // Arrange & Act
    render(
      <Label>
        <span>Nome</span>
        <span>*</span>
      </Label>
    );

    // Assert
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
