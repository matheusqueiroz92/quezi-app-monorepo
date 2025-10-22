/**
 * TDD - Testes para o componente Input
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";

describe("Input Component", () => {
  it("deve renderizar input com placeholder", () => {
    // Arrange & Act
    render(<Input placeholder="Digite aqui" />);

    // Assert
    expect(screen.getByPlaceholderText(/digite aqui/i)).toBeInTheDocument();
  });

  it("deve renderizar input com valor", () => {
    // Arrange & Act
    render(<Input value="Valor inicial" readOnly />);

    // Assert
    expect(screen.getByDisplayValue("Valor inicial")).toBeInTheDocument();
  });

  it("deve permitir digitação no input", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Input />);

    // Act
    const input = screen.getByRole("textbox");
    await user.type(input, "Texto digitado");

    // Assert
    expect(input).toHaveValue("Texto digitado");
  });

  it("deve estar desabilitado quando disabled é true", () => {
    // Arrange & Act
    render(<Input disabled />);

    // Assert
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("deve estar somente leitura quando readOnly é true", () => {
    // Arrange & Act
    render(<Input readOnly />);

    // Assert
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");
  });

  it("deve aceitar diferentes tipos de input", () => {
    // Arrange & Act
    render(
      <div>
        <Input type="text" placeholder="Text input" />
        <Input type="email" placeholder="Email input" />
        <Input type="password" placeholder="Password input" />
        <Input type="number" placeholder="Number input" />
      </div>
    );

    // Assert
    expect(screen.getByPlaceholderText(/text input/i)).toHaveAttribute(
      "type",
      "text"
    );
    expect(screen.getByPlaceholderText(/email input/i)).toHaveAttribute(
      "type",
      "email"
    );
    expect(screen.getByPlaceholderText(/password input/i)).toHaveAttribute(
      "type",
      "password"
    );
    expect(screen.getByPlaceholderText(/number input/i)).toHaveAttribute(
      "type",
      "number"
    );
  });

  it("deve aceitar classes CSS customizadas", () => {
    // Arrange & Act
    render(<Input className="custom-class" placeholder="Custom input" />);

    // Assert
    const input = screen.getByPlaceholderText(/custom input/i);
    expect(input).toHaveClass("custom-class");
  });

  it("deve ter id quando fornecido", () => {
    // Arrange & Act
    render(<Input id="test-input" placeholder="Test input" />);

    // Assert
    const input = screen.getByPlaceholderText(/test input/i);
    expect(input).toHaveAttribute("id", "test-input");
  });

  it("deve ter name quando fornecido", () => {
    // Arrange & Act
    render(<Input name="test-name" placeholder="Test input" />);

    // Assert
    const input = screen.getByPlaceholderText(/test input/i);
    expect(input).toHaveAttribute("name", "test-name");
  });

  it("deve ter maxLength quando fornecido", () => {
    // Arrange & Act
    render(<Input maxLength={10} placeholder="Limited input" />);

    // Assert
    const input = screen.getByPlaceholderText(/limited input/i);
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("deve ter minLength quando fornecido", () => {
    // Arrange & Act
    render(<Input minLength={5} placeholder="Min length input" />);

    // Assert
    const input = screen.getByPlaceholderText(/min length input/i);
    expect(input).toHaveAttribute("minLength", "5");
  });

  it("deve ser acessível com aria-label", () => {
    // Arrange & Act
    render(<Input aria-label="Custom input label" />);

    // Assert
    const input = screen.getByRole("textbox", { name: /custom input label/i });
    expect(input).toBeInTheDocument();
  });

  it("deve ser acessível com aria-describedby", () => {
    // Arrange & Act
    render(
      <div>
        <Input aria-describedby="input-help" placeholder="Described input" />
        <div id="input-help">Help text</div>
      </div>
    );

    // Assert
    const input = screen.getByPlaceholderText(/described input/i);
    expect(input).toHaveAttribute("aria-describedby", "input-help");
  });

  it("deve aceitar ref", () => {
    // Arrange
    const ref = { current: null };
    render(<Input ref={ref} placeholder="Ref input" />);

    // Assert
    expect(ref.current).toBeInTheDocument();
  });

  it("deve renderizar com valor padrão", () => {
    // Arrange & Act
    render(<Input defaultValue="Valor padrão" />);

    // Assert
    expect(screen.getByDisplayValue("Valor padrão")).toBeInTheDocument();
  });
});
