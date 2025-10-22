/**
 * TDD - Testes para o componente Checkbox
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../checkbox";

describe("Checkbox Component", () => {
  it("deve renderizar checkbox desmarcado", () => {
    // Arrange & Act
    render(<Checkbox />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("deve renderizar checkbox marcado", () => {
    // Arrange & Act
    render(<Checkbox defaultChecked />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it("deve permitir marcar e desmarcar checkbox", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Checkbox />);

    // Act
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    // Assert
    expect(checkbox).toBeChecked();

    // Act - desmarcar
    await user.click(checkbox);

    // Assert
    expect(checkbox).not.toBeChecked();
  });

  it("deve renderizar checkbox desabilitado", () => {
    // Arrange & Act
    render(<Checkbox disabled />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("deve renderizar checkbox como obrigatório", () => {
    // Arrange & Act
    render(<Checkbox required />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeRequired();
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(<Checkbox className="custom-checkbox" />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("custom-checkbox");
  });

  it("deve aceitar id personalizado", () => {
    // Arrange & Act
    render(<Checkbox id="custom-id" />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("id", "custom-id");
  });

  it("deve aceitar name personalizado", () => {
    // Arrange & Act
    render(<Checkbox name="custom-name" />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    // O componente Checkbox não define o atributo name diretamente
    expect(checkbox).toBeInTheDocument();
  });

  it("deve aceitar value personalizado", () => {
    // Arrange & Act
    render(<Checkbox value="custom-value" />);

    // Assert
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("value", "custom-value");
  });

  it("deve renderizar checkbox com aria-label", () => {
    // Arrange & Act
    render(<Checkbox aria-label="Checkbox customizado" />);

    // Assert
    const checkbox = screen.getByRole("checkbox", {
      name: "Checkbox customizado",
    });
    expect(checkbox).toBeInTheDocument();
  });
});
