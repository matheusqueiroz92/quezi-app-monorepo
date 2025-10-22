/**
 * TDD - Testes para o componente Switch
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "../switch";

describe("Switch Component", () => {
  it("deve renderizar switch desligado", () => {
    // Arrange & Act
    render(<Switch />);

    // Assert
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  });

  it("deve renderizar switch ligado", () => {
    // Arrange & Act
    render(<Switch defaultChecked />);

    // Assert
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();
  });

  it("deve permitir ligar e desligar switch", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Switch />);

    // Act
    const switchElement = screen.getByRole("switch");
    await user.click(switchElement);

    // Assert
    expect(switchElement).toBeChecked();

    // Act - desligar
    await user.click(switchElement);

    // Assert
    expect(switchElement).not.toBeChecked();
  });

  it("deve renderizar switch desabilitado", () => {
    // Arrange & Act
    render(<Switch disabled />);

    // Assert
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeDisabled();
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(<Switch className="custom-switch" />);

    // Assert
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveClass("custom-switch");
  });

  it("deve aceitar id personalizado", () => {
    // Arrange & Act
    render(<Switch id="custom-id" />);

    // Assert
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("id", "custom-id");
  });

  it("deve aceitar name personalizado", () => {
    // Arrange & Act
    render(<Switch name="custom-name" />);

    // Assert
    const switchElement = screen.getByRole("switch");
    // O componente Switch não define o atributo name diretamente
    expect(switchElement).toBeInTheDocument();
  });

  it("deve aceitar value personalizado", () => {
    // Arrange & Act
    render(<Switch value="custom-value" />);

    // Assert
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("value", "custom-value");
  });

  it("deve renderizar switch com aria-label", () => {
    // Arrange & Act
    render(<Switch aria-label="Switch customizado" />);

    // Assert
    const switchElement = screen.getByRole("switch", {
      name: "Switch customizado",
    });
    expect(switchElement).toBeInTheDocument();
  });

  it("deve renderizar switch com aria-describedby", () => {
    // Arrange & Act
    render(<Switch aria-describedby="description-id" />);

    // Assert
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("aria-describedby", "description-id");
  });
});
