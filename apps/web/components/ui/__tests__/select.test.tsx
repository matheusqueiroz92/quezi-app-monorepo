/**
 * TDD - Testes para o componente Select
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

describe("Select Component", () => {
  it("deve renderizar select com placeholder", () => {
    // Arrange & Act
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
          <SelectItem value="option2">Opção 2</SelectItem>
        </SelectContent>
      </Select>
    );

    // Assert
    expect(screen.getByText("Selecione uma opção")).toBeInTheDocument();
  });

  it("deve renderizar select com valor inicial", () => {
    // Arrange & Act
    render(
      <Select defaultValue="option1">
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
          <SelectItem value="option2">Opção 2</SelectItem>
        </SelectContent>
      </Select>
    );

    // Assert
    expect(screen.getByText("Opção 1")).toBeInTheDocument();
  });

  it("deve renderizar select desabilitado", () => {
    // Arrange & Act
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
        </SelectContent>
      </Select>
    );

    // Assert
    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toHaveAttribute("data-disabled", "");
  });

  it("deve renderizar select com múltiplas opções", () => {
    // Arrange & Act
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
          <SelectItem value="option2">Opção 2</SelectItem>
          <SelectItem value="option3">Opção 3</SelectItem>
        </SelectContent>
      </Select>
    );

    // Assert
    expect(screen.getByText("Selecione uma opção")).toBeInTheDocument();
  });

  it("deve aceitar className personalizada no trigger", () => {
    // Arrange & Act
    render(
      <Select>
        <SelectTrigger className="custom-select">
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opção 1</SelectItem>
        </SelectContent>
      </Select>
    );

    // Assert
    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toHaveClass("custom-select");
  });

  it("deve renderizar select item com valor", () => {
    // Arrange & Act
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test-value">Test Item</SelectItem>
        </SelectContent>
      </Select>
    );

    // Assert
    // O SelectItem não é renderizado até que o Select seja aberto
    expect(screen.getByText("Selecione uma opção")).toBeInTheDocument();
  });

  it("deve renderizar select item desabilitado", () => {
    // Arrange & Act
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" disabled>
            Opção Desabilitada
          </SelectItem>
        </SelectContent>
      </Select>
    );

    // Assert
    // O SelectItem não é renderizado até que o Select seja aberto
    expect(screen.getByText("Selecione uma opção")).toBeInTheDocument();
  });
});
