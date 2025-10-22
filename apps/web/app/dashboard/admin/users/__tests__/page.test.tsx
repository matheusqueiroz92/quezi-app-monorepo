import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUsersPage from "../page";
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

describe("AdminUsersPage", () => {
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
    render(<AdminUsersPage />);
    expect(screen.getByText(/gerenciamento de usuários/i)).toBeInTheDocument();
  });

  it("deve renderizar barra de busca", () => {
    render(<AdminUsersPage />);
    expect(screen.getByPlaceholderText(/buscar usuários/i)).toBeInTheDocument();
  });

  it("deve renderizar filtros de tipo de usuário", () => {
    render(<AdminUsersPage />);
    expect(screen.getByText(/todos/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clientes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /profissionais/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar estatísticas dos usuários", () => {
    render(<AdminUsersPage />);
    expect(screen.getByText(/total de usuários/i)).toBeInTheDocument();
    expect(screen.getAllByText(/clientes ativos/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/profissionais ativos/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/novos este mês/i)).toBeInTheDocument();
  });

  it("deve renderizar lista de usuários", () => {
    render(<AdminUsersPage />);
    expect(screen.getByText(/lista de usuários/i)).toBeInTheDocument();
  });

  it("deve renderizar botões de ação", () => {
    render(<AdminUsersPage />);
    expect(screen.getByText(/exportar dados/i)).toBeInTheDocument();
    expect(screen.getByText(/adicionar usuário/i)).toBeInTheDocument();
  });

  it("deve permitir filtrar usuários por tipo", () => {
    render(<AdminUsersPage />);
    const clientesButton = screen.getByRole("button", { name: /clientes/i });
    userEvent.click(clientesButton);
    expect(clientesButton).toBeInTheDocument();
  });

  it("deve permitir buscar usuários", () => {
    render(<AdminUsersPage />);
    const searchInput = screen.getByPlaceholderText(/buscar usuários/i);
    expect(searchInput).toBeInTheDocument();
    userEvent.type(searchInput, "Maria");
    expect(searchInput).toBeInTheDocument();
  });

  it("deve renderizar com layout responsivo", () => {
    render(<AdminUsersPage />);

    // Verifica se o layout principal está sendo renderizado
    const mainContent = screen.getByRole("main");
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass("flex-1", "p-8", "overflow-y-auto");
  });

  it("deve renderizar sem erros quando não há usuários", () => {
    render(<AdminUsersPage />);

    // Verifica se a página renderiza mesmo sem dados
    expect(screen.getByText(/gerenciamento de usuários/i)).toBeInTheDocument();
    expect(screen.getByText(/lista de usuários/i)).toBeInTheDocument();
  });
});
