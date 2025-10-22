/**
 * TDD - Testes para o componente Textarea
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "../textarea";

describe("Textarea Component", () => {
  it("deve renderizar textarea com placeholder", () => {
    // Arrange & Act
    render(<Textarea placeholder="Digite sua mensagem" />);

    // Assert
    expect(
      screen.getByPlaceholderText("Digite sua mensagem")
    ).toBeInTheDocument();
  });

  it("deve renderizar textarea com valor", () => {
    // Arrange & Act
    render(<Textarea value="Valor inicial" readOnly />);

    // Assert
    expect(screen.getByDisplayValue("Valor inicial")).toBeInTheDocument();
  });

  it("deve permitir digitação no textarea", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Textarea />);

    // Act
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Texto digitado");

    // Assert
    expect(textarea).toHaveValue("Texto digitado");
  });

  it("deve renderizar textarea desabilitado", () => {
    // Arrange & Act
    render(<Textarea disabled />);

    // Assert
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("deve renderizar textarea como obrigatório", () => {
    // Arrange & Act
    render(<Textarea required />);

    // Assert
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(<Textarea className="custom-class" />);

    // Assert
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("deve aceitar props padrão do textarea", () => {
    // Arrange & Act
    render(<Textarea rows={5} cols={50} />);

    // Assert
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("cols", "50");
  });
});
