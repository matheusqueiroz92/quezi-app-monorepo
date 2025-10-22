/**
 * Testes completos para componente EmptyState
 */

import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState Component", () => {
  it("deve renderizar estado vazio com título e descrição", () => {
    render(
      <EmptyState
        title="Nenhum item encontrado"
        description="Não há itens para exibir no momento."
      />
    );

    expect(screen.getByText("Nenhum item encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("Não há itens para exibir no momento.")
    ).toBeInTheDocument();
  });

  it("deve renderizar com ícone customizado", () => {
    render(
      <EmptyState
        title="Sem dados"
        description="Nenhum dado disponível."
        icon="📊"
      />
    );

    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("deve renderizar botão de ação quando fornecido", () => {
    const handleAction = jest.fn();
    render(
      <EmptyState
        title="Sem dados"
        description="Nenhum dado disponível."
        actionLabel="Adicionar item"
        onAction={handleAction}
      />
    );

    const button = screen.getByText("Adicionar item");
    expect(button).toBeInTheDocument();

    button.click();
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("deve aplicar className customizada", () => {
    render(
      <EmptyState
        title="Teste"
        description="Descrição"
        className="custom-empty-state"
      />
    );

    const container = screen.getByText("Teste").closest("div");
    expect(container).toHaveClass("custom-empty-state");
  });

  it("deve renderizar sem botão quando onAction não é fornecido", () => {
    render(
      <EmptyState
        title="Sem dados"
        description="Nenhum dado disponível."
        actionLabel="Adicionar item"
      />
    );

    expect(screen.queryByText("Adicionar item")).not.toBeInTheDocument();
  });

  it("deve ter estrutura HTML correta", () => {
    render(<EmptyState title="Teste" description="Descrição" icon="🎯" />);

    const container = screen.getByText("Teste").closest("div");
    expect(container).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "justify-center"
    );
  });

  it("deve renderizar com tamanho pequeno", () => {
    render(<EmptyState title="Teste" description="Descrição" size="sm" />);

    const title = screen.getByText("Teste");
    expect(title).toHaveClass("text-lg");
  });

  it("deve renderizar com tamanho médio", () => {
    render(<EmptyState title="Teste" description="Descrição" size="md" />);

    const title = screen.getByText("Teste");
    expect(title).toHaveClass("text-xl");
  });

  it("deve renderizar com tamanho grande", () => {
    render(<EmptyState title="Teste" description="Descrição" size="lg" />);

    const title = screen.getByText("Teste");
    expect(title).toHaveClass("text-2xl");
  });
});
