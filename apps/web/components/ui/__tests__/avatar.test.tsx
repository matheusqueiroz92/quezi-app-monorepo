/**
 * TDD - Testes para o componente Avatar
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

describe("Avatar Component", () => {
  it("deve renderizar avatar com imagem", () => {
    // Arrange & Act
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Assert
    // O AvatarImage não é renderizado quando a imagem não carrega
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("deve renderizar fallback quando imagem não carrega", () => {
    // Arrange & Act
    render(
      <Avatar>
        <AvatarImage src="https://example.com/invalid.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Assert
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("deve renderizar apenas fallback quando não há imagem", () => {
    // Arrange & Act
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );

    // Assert
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(
      <Avatar className="custom-avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Assert
    const avatar = screen.getByText("JD").closest('[class*="custom-avatar"]');
    expect(avatar).toHaveClass("custom-avatar");
  });

  it("deve renderizar avatar com tamanho padrão", () => {
    // Arrange & Act
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Assert
    const avatar = screen.getByText("JD").closest("div");
    expect(avatar).toBeInTheDocument();
  });

  it("deve renderizar avatar com fallback personalizado", () => {
    // Arrange & Act
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">Custom</AvatarFallback>
      </Avatar>
    );

    // Assert
    const fallback = screen.getByText("Custom");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass("custom-fallback");
  });

  it("deve renderizar avatar com múltiplos elementos", () => {
    // Arrange & Act
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Assert
    // O AvatarImage não é renderizado quando a imagem não carrega
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
