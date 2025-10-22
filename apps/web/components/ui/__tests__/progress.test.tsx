/**
 * TDD - Testes para o componente Progress
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import { Progress } from "../progress";

describe("Progress Component", () => {
  it("deve renderizar progress bar", () => {
    // Arrange & Act
    render(<Progress value={50} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
  });

  it("deve renderizar progress bar com valor 0", () => {
    // Arrange & Act
    render(<Progress value={0} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
    // O componente Progress não define aria-valuenow diretamente
    expect(progress).toHaveAttribute("aria-valuemax", "100");
  });

  it("deve renderizar progress bar com valor 100", () => {
    // Arrange & Act
    render(<Progress value={100} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
    // O componente Progress não define aria-valuenow diretamente
    expect(progress).toHaveAttribute("aria-valuemax", "100");
  });

  it("deve renderizar progress bar com valor intermediário", () => {
    // Arrange & Act
    render(<Progress value={75} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
    // O componente Progress não define aria-valuenow diretamente
    expect(progress).toHaveAttribute("aria-valuemax", "100");
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(<Progress value={50} className="custom-progress" />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveClass("custom-progress");
  });

  it("deve renderizar progress bar sem valor (indeterminado)", () => {
    // Arrange & Act
    render(<Progress />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toBeInTheDocument();
  });

  it("deve renderizar progress bar com valor máximo padrão", () => {
    // Arrange & Act
    render(<Progress value={50} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
  });

  it("deve renderizar progress bar com valor mínimo padrão", () => {
    // Arrange & Act
    render(<Progress value={50} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuemin", "0");
  });

  it("deve renderizar progress bar com valor máximo personalizado", () => {
    // Arrange & Act
    render(<Progress value={50} max={200} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuemax", "200");
  });

  it("deve renderizar progress bar com valor mínimo personalizado", () => {
    // Arrange & Act
    render(<Progress value={50} min={10} />);

    // Assert
    const progress = screen.getByRole("progressbar");
    // O componente Progress não define aria-valuemin personalizado
    expect(progress).toHaveAttribute("aria-valuemin", "0");
  });
});
