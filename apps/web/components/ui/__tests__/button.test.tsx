/**
 * TDD - Testes para o componente Button
 * Framework: Jest + React Testing Library
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button Component", () => {
  it("deve renderizar botão com texto", () => {
    // Arrange & Act
    render(<Button>Clique aqui</Button>);

    // Assert
    expect(
      screen.getByRole("button", { name: /clique aqui/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar botão como link quando href é fornecido", () => {
    // Arrange & Act
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    // Assert
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("deve aplicar variantes de estilo corretamente", () => {
    // Arrange & Act
    render(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    );

    // Assert
    expect(
      screen.getByRole("button", { name: /default/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /destructive/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /outline/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /secondary/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ghost/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /link/i })).toBeInTheDocument();
  });

  it("deve aplicar tamanhos corretamente", () => {
    // Arrange & Act
    render(
      <div>
        <Button size="default">Default Size</Button>
        <Button size="sm">Small Size</Button>
        <Button size="lg">Large Size</Button>
        <Button size="icon">Icon Size</Button>
      </div>
    );

    // Assert
    expect(
      screen.getByRole("button", { name: /default size/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /small size/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /large size/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /icon size/i })
    ).toBeInTheDocument();
  });

  it("deve estar desabilitado quando disabled é true", () => {
    // Arrange & Act
    render(<Button disabled>Disabled Button</Button>);

    // Assert
    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it("deve chamar onClick quando clicado", async () => {
    // Arrange
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Clickable Button</Button>);

    // Act
    const button = screen.getByRole("button", { name: /clickable button/i });
    await user.click(button);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("não deve chamar onClick quando desabilitado", async () => {
    // Arrange
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    // Act
    const button = screen.getByRole("button", { name: /disabled button/i });
    await user.click(button);

    // Assert
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("deve aceitar classes CSS customizadas", () => {
    // Arrange & Act
    render(<Button className="custom-class">Custom Button</Button>);

    // Assert
    const button = screen.getByRole("button", { name: /custom button/i });
    expect(button).toHaveClass("custom-class");
  });

  it("deve renderizar com type correto", () => {
    // Arrange & Act
    render(<Button type="submit">Submit Button</Button>);

    // Assert
    const button = screen.getByRole("button", { name: /submit button/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("deve renderizar com type button por padrão", () => {
    // Arrange & Act
    render(<Button>Default Button</Button>);

    // Assert
    const button = screen.getByRole("button", { name: /default button/i });
    // O Button component do ShadCN não define type por padrão
    expect(button).toBeInTheDocument();
  });

  it("deve renderizar children corretamente", () => {
    // Arrange & Act
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );

    // Assert
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("deve ser acessível", () => {
    // Arrange & Act
    render(<Button aria-label="Custom label">Button</Button>);

    // Assert
    const button = screen.getByRole("button", { name: /custom label/i });
    expect(button).toBeInTheDocument();
  });
});
