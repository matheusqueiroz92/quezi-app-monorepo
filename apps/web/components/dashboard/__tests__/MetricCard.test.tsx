import { render, screen } from "@testing-library/react";
import { MetricCard } from "../MetricCard";

describe("MetricCard Component", () => {
  it("deve renderizar o título da métrica", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        trend={{ value: 12, direction: "up" }}
      />
    );

    expect(screen.getByText("Total de Usuários")).toBeInTheDocument();
  });

  it("deve renderizar o valor da métrica", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        trend={{ value: 12, direction: "up" }}
      />
    );

    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("deve renderizar o ícone da métrica", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        trend={{ value: 12, direction: "up" }}
      />
    );

    // Verifica se o ícone está presente (Lucide React)
    const iconElement = screen.getByTestId("metric-icon");
    expect(iconElement).toBeInTheDocument();
  });

  it("deve renderizar tendência positiva", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        trend={{ value: 12, direction: "up" }}
      />
    );

    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByTestId("trend-up")).toBeInTheDocument();
  });

  it("deve renderizar tendência negativa", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        trend={{ value: 5, direction: "down" }}
      />
    );

    expect(screen.getByText("-5%")).toBeInTheDocument();
    expect(screen.getByTestId("trend-down")).toBeInTheDocument();
  });

  it("deve renderizar sem tendência", () => {
    render(<MetricCard title="Total de Usuários" value="1,234" icon="Users" />);

    expect(screen.queryByTestId("trend-up")).not.toBeInTheDocument();
    expect(screen.queryByTestId("trend-down")).not.toBeInTheDocument();
  });

  it("deve renderizar o card corretamente", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        trend={{ value: 12, direction: "up" }}
      />
    );

    // Verifica se o card está sendo renderizado
    expect(screen.getByText("Total de Usuários")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("deve renderizar com descrição adicional", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        description="Usuários cadastrados na plataforma"
        trend={{ value: 12, direction: "up" }}
      />
    );

    expect(
      screen.getByText("Usuários cadastrados na plataforma")
    ).toBeInTheDocument();
  });

  it("deve renderizar com cor personalizada", () => {
    render(
      <MetricCard
        title="Total de Usuários"
        value="1,234"
        icon="Users"
        color="marsala"
        trend={{ value: 12, direction: "up" }}
      />
    );

    // Verifica se o ícone está presente (a cor é aplicada no container, não no ícone)
    const iconElement = screen.getByTestId("metric-icon");
    expect(iconElement).toBeInTheDocument();

    // Verifica se o container do ícone tem a cor correta
    const iconContainer = iconElement.closest("div");
    expect(iconContainer).toHaveClass("text-marsala");
  });
});
