import { render, screen } from "@testing-library/react";
import { ChartCard } from "../ChartCard";

// Mock do Recharts para evitar problemas de renderização em testes
jest.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe("ChartCard Component", () => {
  const mockData = [
    { name: "Jan", value: 100 },
    { name: "Fev", value: 150 },
    { name: "Mar", value: 200 },
  ];

  it("deve renderizar o título do gráfico", () => {
    render(
      <ChartCard
        title="Evolução de Usuários"
        data={mockData}
        dataKey="value"
        color="#69042A"
      />
    );

    expect(screen.getByText("Evolução de Usuários")).toBeInTheDocument();
  });

  it("deve renderizar o gráfico", () => {
    render(
      <ChartCard
        title="Evolução de Usuários"
        data={mockData}
        dataKey="value"
        color="#69042A"
      />
    );

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("deve renderizar com descrição", () => {
    render(
      <ChartCard
        title="Evolução de Usuários"
        description="Crescimento mensal de usuários cadastrados"
        data={mockData}
        dataKey="value"
        color="#69042A"
      />
    );

    expect(
      screen.getByText("Crescimento mensal de usuários cadastrados")
    ).toBeInTheDocument();
  });

  it("deve renderizar com estatísticas", () => {
    render(
      <ChartCard
        title="Evolução de Usuários"
        data={mockData}
        dataKey="value"
        color="#69042A"
        stats={{
          total: "450",
          change: "+50%",
          period: "vs mês anterior",
        }}
      />
    );

    expect(screen.getByText("450")).toBeInTheDocument();
    expect(screen.getByText("+50%")).toBeInTheDocument();
    expect(screen.getByText("vs mês anterior")).toBeInTheDocument();
  });

  it("deve renderizar o card corretamente", () => {
    render(
      <ChartCard
        title="Evolução de Usuários"
        data={mockData}
        dataKey="value"
        color="#69042A"
      />
    );

    // Verifica se o card está sendo renderizado
    expect(screen.getByText("Evolução de Usuários")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("deve renderizar com altura personalizada", () => {
    render(
      <ChartCard
        title="Evolução de Usuários"
        data={mockData}
        dataKey="value"
        color="#69042A"
        height={400}
      />
    );

    // Verifica se o gráfico foi renderizado (altura personalizada é aplicada via CSS)
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("deve renderizar sem dados", () => {
    render(
      <ChartCard
        title="Evolução de Usuários"
        data={[]}
        dataKey="value"
        color="#69042A"
      />
    );

    expect(screen.getByText("Evolução de Usuários")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});
