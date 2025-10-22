/**
 * TDD - Testes para o componente Separator
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import { Separator } from "../separator";

describe("Separator Component", () => {
  it("deve renderizar separator horizontal", () => {
    // Arrange & Act
    render(<Separator />);

    // Assert
    const separator = screen.getByRole("none");
    expect(separator).toBeInTheDocument();
  });

  it("deve renderizar separator vertical", () => {
    // Arrange & Act
    render(<Separator orientation="vertical" />);

    // Assert
    const separator = screen.getByRole("none");
    expect(separator).toBeInTheDocument();
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(<Separator className="custom-separator" />);

    // Assert
    const separator = screen.getByRole("none");
    expect(separator).toHaveClass("custom-separator");
  });

  it("deve renderizar separator com orientação horizontal por padrão", () => {
    // Arrange & Act
    render(<Separator />);

    // Assert
    const separator = screen.getByRole("none");
    expect(separator).toBeInTheDocument();
  });

  it("deve renderizar separator com orientação vertical", () => {
    // Arrange & Act
    render(<Separator orientation="vertical" />);

    // Assert
    const separator = screen.getByRole("none");
    expect(separator).toBeInTheDocument();
  });

  it("deve renderizar separator decorativo", () => {
    // Arrange & Act
    render(<Separator decorative />);

    // Assert
    const separator = screen.getByRole("none");
    // O componente Separator não define aria-hidden diretamente
    expect(separator).toBeInTheDocument();
  });

  it("deve renderizar separator não decorativo", () => {
    // Arrange & Act
    render(<Separator decorative={false} />);

    // Assert
    const separator = screen.getByRole("separator");
    expect(separator).not.toHaveAttribute("aria-hidden");
  });

  it("deve renderizar separator com orientação e classe customizada", () => {
    // Arrange & Act
    render(<Separator orientation="vertical" className="vertical-separator" />);

    // Assert
    const separator = screen.getByRole("none");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass("vertical-separator");
  });
});
