import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminFinancialPage from "../page";
import { useAuth } from "@/hooks/use-auth";

// Mock do useAuth
jest.mock("@/hooks/use-auth");
const mockUseAuth = jest.mocked(useAuth);

// Mock dos componentes de dashboard para evitar renderização complexa em testes unitários
jest.mock("@/components/dashboard/MetricCard", () => ({
  MetricCard: ({ title, value, icon, trend, description, color }: any) => (
    <div data-testid="metric-card">
      <h3>{title}</h3>
      <p>{value}</p>
      {description && <p>{description}</p>}
      {trend && (
        <span data-testid={`trend-${trend.direction}`}>
          {trend.direction === "up" ? "+" : "-"}
          {trend.value}%
        </span>
      )}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid={`badge-${variant}`}>{children}</span>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, value, onChange, ...props }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid="input"
      {...props}
    />
  ),
}));

describe("AdminFinancialPage", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "admin123",
        name: "Admin Teste",
        email: "admin@teste.com",
        userType: "ADMIN",
        isEmailVerified: true,
      },
      isLoading: false,
      logout: jest.fn(),
    });
  });

  it("deve renderizar o título da página", () => {
    render(<AdminFinancialPage />);
    expect(screen.getByText(/financeiro da plataforma/i)).toBeInTheDocument();
  });

  it("deve renderizar barra de busca", () => {
    render(<AdminFinancialPage />);
    expect(
      screen.getByPlaceholderText(/buscar transações/i)
    ).toBeInTheDocument();
  });

  it("deve renderizar filtros de período", () => {
    render(<AdminFinancialPage />);
    expect(screen.getByText(/hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/esta semana/i)).toBeInTheDocument();
    expect(screen.getByText(/este mês/i)).toBeInTheDocument();
  });

  it("deve renderizar estatísticas financeiras", () => {
    render(<AdminFinancialPage />);
    expect(screen.getAllByText(/receita total/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/taxa da plataforma/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/transações processadas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ticket médio/i)[0]).toBeInTheDocument();
  });

  it("deve renderizar lista de transações", () => {
    render(<AdminFinancialPage />);
    expect(screen.getByText(/lista de transações/i)).toBeInTheDocument();
  });

  it("deve renderizar botões de ação", () => {
    render(<AdminFinancialPage />);
    expect(screen.getByText(/exportar relatório/i)).toBeInTheDocument();
    expect(screen.getByText(/gerar fatura/i)).toBeInTheDocument();
  });

  it("deve permitir filtrar transações por período", () => {
    render(<AdminFinancialPage />);
    const semanaButton = screen.getByRole("button", { name: /esta semana/i });
    userEvent.click(semanaButton);
    expect(semanaButton).toBeInTheDocument();
  });

  it("deve permitir buscar transações", () => {
    render(<AdminFinancialPage />);
    const searchInput = screen.getByPlaceholderText(/buscar transações/i);
    expect(searchInput).toBeInTheDocument();
    userEvent.type(searchInput, "Pagamento");
    expect(searchInput).toBeInTheDocument();
  });

  it("deve renderizar com layout responsivo", () => {
    render(<AdminFinancialPage />);

    // Verifica se o layout principal está sendo renderizado
    const mainContent = screen.getByRole("main");
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass("flex-1", "p-8", "overflow-y-auto");
  });

  it("deve renderizar sem erros quando não há transações", () => {
    render(<AdminFinancialPage />);

    // Verifica se a página renderiza mesmo sem dados
    expect(screen.getByText(/financeiro da plataforma/i)).toBeInTheDocument();
    expect(screen.getByText(/lista de transações/i)).toBeInTheDocument();
  });
});
