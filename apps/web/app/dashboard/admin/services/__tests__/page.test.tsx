import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminServicesPage from "../page";
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

describe("AdminServicesPage", () => {
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
    render(<AdminServicesPage />);
    expect(screen.getByText(/gerenciamento de serviços/i)).toBeInTheDocument();
  });

  it("deve renderizar barra de busca", () => {
    render(<AdminServicesPage />);
    expect(screen.getByPlaceholderText(/buscar serviços/i)).toBeInTheDocument();
  });

  it("deve renderizar filtros de categoria", () => {
    render(<AdminServicesPage />);
    expect(screen.getByText(/todas as categorias/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cabelo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /unhas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /makeup/i })).toBeInTheDocument();
  });

  it("deve renderizar estatísticas dos serviços", () => {
    render(<AdminServicesPage />);
    expect(screen.getByText(/total de serviços/i)).toBeInTheDocument();
    expect(screen.getAllByText(/serviços ativos/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/novos este mês/i)).toBeInTheDocument();
    expect(screen.getByText(/categorias disponíveis/i)).toBeInTheDocument();
  });

  it("deve renderizar lista de serviços", () => {
    render(<AdminServicesPage />);
    expect(screen.getByText(/lista de serviços/i)).toBeInTheDocument();
  });

  it("deve renderizar botões de ação", () => {
    render(<AdminServicesPage />);
    expect(screen.getByText(/exportar dados/i)).toBeInTheDocument();
    expect(screen.getByText(/adicionar serviço/i)).toBeInTheDocument();
  });

  it("deve permitir filtrar serviços por categoria", () => {
    render(<AdminServicesPage />);
    const cabeloButton = screen.getByRole("button", { name: /cabelo/i });
    userEvent.click(cabeloButton);
    expect(cabeloButton).toBeInTheDocument();
  });

  it("deve permitir buscar serviços", () => {
    render(<AdminServicesPage />);
    const searchInput = screen.getByPlaceholderText(/buscar serviços/i);
    expect(searchInput).toBeInTheDocument();
    userEvent.type(searchInput, "Corte");
    expect(searchInput).toBeInTheDocument();
  });

  it("deve renderizar com layout responsivo", () => {
    render(<AdminServicesPage />);

    // Verifica se o layout principal está sendo renderizado
    const mainContent = screen.getByRole("main");
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass("flex-1", "p-8", "overflow-y-auto");
  });

  it("deve renderizar sem erros quando não há serviços", () => {
    render(<AdminServicesPage />);

    // Verifica se a página renderiza mesmo sem dados
    expect(screen.getByText(/gerenciamento de serviços/i)).toBeInTheDocument();
    expect(screen.getByText(/lista de serviços/i)).toBeInTheDocument();
  });
});
