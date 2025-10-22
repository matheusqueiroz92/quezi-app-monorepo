/**
 * TDD - Testes para o componente Card
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";

describe("Card Component", () => {
  it("deve renderizar card básico", () => {
    // Arrange & Act
    render(
      <Card>
        <CardContent>Conteúdo do card</CardContent>
      </Card>
    );

    // Assert
    expect(screen.getByText("Conteúdo do card")).toBeInTheDocument();
  });

  it("deve renderizar card com header", () => {
    // Arrange & Act
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título do Card</CardTitle>
          <CardDescription>Descrição do card</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo do card</CardContent>
      </Card>
    );

    // Assert
    expect(screen.getByText("Título do Card")).toBeInTheDocument();
    expect(screen.getByText("Descrição do card")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do card")).toBeInTheDocument();
  });

  it("deve renderizar card com footer", () => {
    // Arrange & Act
    render(
      <Card>
        <CardContent>Conteúdo do card</CardContent>
        <CardFooter>Rodapé do card</CardFooter>
      </Card>
    );

    // Assert
    expect(screen.getByText("Conteúdo do card")).toBeInTheDocument();
    expect(screen.getByText("Rodapé do card")).toBeInTheDocument();
  });

  it("deve renderizar card completo", () => {
    // Arrange & Act
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título do Card</CardTitle>
          <CardDescription>Descrição do card</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo do card</CardContent>
        <CardFooter>Rodapé do card</CardFooter>
      </Card>
    );

    // Assert
    expect(screen.getByText("Título do Card")).toBeInTheDocument();
    expect(screen.getByText("Descrição do card")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do card")).toBeInTheDocument();
    expect(screen.getByText("Rodapé do card")).toBeInTheDocument();
  });

  it("deve aceitar children vazios", () => {
    // Arrange & Act
    render(<Card>{null}</Card>);

    // Assert
    expect(screen.getAllByRole("generic")[0]).toBeInTheDocument();
  });
});
