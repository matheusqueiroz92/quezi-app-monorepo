import { render, screen } from "@testing-library/react";
import { StatsGrid } from "../StatsGrid";

describe("StatsGrid Component", () => {
  const mockStats = [
    {
      title: "Total de Usuários",
      value: "1,234",
      icon: "Users",
      trend: { value: 12, direction: "up" as const },
    },
    {
      title: "Receita Mensal",
      value: "R$ 45.678",
      icon: "DollarSign",
      trend: { value: 8, direction: "up" as const },
    },
    {
      title: "Agendamentos",
      value: "567",
      icon: "Calendar",
      trend: { value: 3, direction: "down" as const },
    },
  ];

  it("deve renderizar todos os cards de estatísticas", () => {
    render(<StatsGrid stats={mockStats} />);

    expect(screen.getByText("Total de Usuários")).toBeInTheDocument();
    expect(screen.getByText("Receita Mensal")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
  });

  it("deve renderizar os valores das estatísticas", () => {
    render(<StatsGrid stats={mockStats} />);

    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("R$ 45.678")).toBeInTheDocument();
    expect(screen.getByText("567")).toBeInTheDocument();
  });

  it("deve renderizar as tendências", () => {
    render(<StatsGrid stats={mockStats} />);

    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("+8%")).toBeInTheDocument();
    expect(screen.getByText("-3%")).toBeInTheDocument();
  });

  it("deve aplicar classes CSS corretas para o grid", () => {
    render(<StatsGrid stats={mockStats} />);

    const grid = screen.getByTestId("stats-grid");
    expect(grid).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "gap-6"
    );
  });

  it("deve renderizar com grid responsivo", () => {
    render(<StatsGrid stats={mockStats} columns={{ sm: 1, md: 2, lg: 4 }} />);

    const grid = screen.getByTestId("stats-grid");
    expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-4");
  });

  it("deve renderizar com gap personalizado", () => {
    render(<StatsGrid stats={mockStats} gap="gap-4" />);

    const grid = screen.getByTestId("stats-grid");
    expect(grid).toHaveClass("gap-4");
  });

  it("deve renderizar sem estatísticas", () => {
    render(<StatsGrid stats={[]} />);

    const grid = screen.getByTestId("stats-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toBeEmptyDOMElement();
  });

  it("deve renderizar com uma única estatística", () => {
    const singleStat = [mockStats[0]];
    render(<StatsGrid stats={singleStat} />);

    expect(screen.getByText("Total de Usuários")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });
});
