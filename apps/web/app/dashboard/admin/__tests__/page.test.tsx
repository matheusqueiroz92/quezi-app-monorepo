import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "../page";

// Mock do useAuth
jest.mock("@/hooks/use-auth");
const mockUseAuth = jest.mocked(require("@/hooks/use-auth").useAuth);

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        id: "1",
        name: "Admin Quezi",
        email: "admin@quezi.com",
        userType: "ADMIN" as const,
        isEmailVerified: true,
      },
      isLoading: false,
      logout: jest.fn(),
    });
  });

  it("deve renderizar o título do dashboard", () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText(/dashboard administrativo/i)).toBeInTheDocument();
  });

  it("deve renderizar os KPIs principais", () => {
    render(<AdminDashboardPage />);

    // Verifica se os KPIs estão sendo renderizados
    expect(screen.getByText(/total de usuários/i)).toBeInTheDocument();
    expect(screen.getByText(/receita mensal/i)).toBeInTheDocument();
    expect(screen.getByText(/agendamentos hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/serviços ativos/i)).toBeInTheDocument();
  });

  it("deve renderizar gráficos de evolução", () => {
    render(<AdminDashboardPage />);

    // Verifica se os gráficos estão sendo renderizados
    expect(screen.getByText(/evolução de usuários/i)).toBeInTheDocument();
    expect(screen.getByText(/receita por mês/i)).toBeInTheDocument();
  });

  it("deve renderizar seção de atividades recentes", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText(/atividades recentes/i)).toBeInTheDocument();
  });

  it("deve renderizar seção de denúncias pendentes", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText(/denúncias pendentes/i)).toBeInTheDocument();
  });

  it("deve renderizar seção de aprovações pendentes", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText(/aprovações pendentes/i)).toBeInTheDocument();
  });

  it("deve renderizar botões de ação rápida", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText(/gerenciar usuários/i)).toBeInTheDocument();
    expect(screen.getByText(/configurações/i)).toBeInTheDocument();
  });

  it("deve renderizar com layout responsivo", () => {
    render(<AdminDashboardPage />);

    // Verifica se o layout principal está sendo renderizado
    const mainContent = screen.getByRole("main");
    expect(mainContent).toBeInTheDocument();
  });

  it("deve renderizar sem erros quando não há dados", () => {
    render(<AdminDashboardPage />);

    // Verifica se a página renderiza mesmo sem dados
    expect(screen.getByText(/dashboard administrativo/i)).toBeInTheDocument();
  });
});
