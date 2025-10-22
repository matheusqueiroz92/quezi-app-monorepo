import { render, screen } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import { useAuth } from "@/hooks/use-auth";

// Mock do useAuth
jest.mock("@/hooks/use-auth");
const mockUseAuth = jest.mocked(useAuth);

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock padrão para cliente
    mockUseAuth.mockReturnValue({
      user: {
        id: "1",
        name: "Maria Silva",
        email: "maria@teste.com",
        userType: "CLIENT" as const,
        isEmailVerified: true,
      },
      isLoading: false,
      logout: jest.fn(),
    });
  });

  it("deve renderizar o sidebar com logo", () => {
    render(<Sidebar />);
    expect(screen.getByText(/uezi/i)).toBeInTheDocument();
  });

  it("deve renderizar informações do usuário", () => {
    render(<Sidebar />);
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
  });

  it("deve renderizar botão de configuração do usuário", () => {
    render(<Sidebar />);
    expect(screen.getByText(/configurar usuário/i)).toBeInTheDocument();
  });

  it("deve renderizar itens do menu de navegação para cliente", () => {
    render(<Sidebar />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/informações pessoais/i)).toBeInTheDocument();
    expect(screen.getByText(/endereços salvos/i)).toBeInTheDocument();
    expect(screen.getByText(/métodos de pagamento/i)).toBeInTheDocument();
    expect(screen.getByText(/histórico de agendamentos/i)).toBeInTheDocument();
    expect(screen.getByText(/serviços favoritos/i)).toBeInTheDocument();
    expect(screen.getByText(/sair/i)).toBeInTheDocument();
  });

  it("deve renderizar avatar do usuário", () => {
    render(<Sidebar />);
    const avatar = screen.getByText("MS"); // Iniciais do nome
    expect(avatar).toBeInTheDocument();
  });

  it("deve ter classe CSS correta para sidebar", () => {
    render(<Sidebar />);
    const sidebar = screen.getByRole("navigation");
    expect(sidebar).toHaveClass("bg-white", "shadow-lg", "border-r");
  });

  it("deve renderizar itens do menu de navegação para profissional", () => {
    // Mock do useAuth para profissional
    mockUseAuth.mockReturnValue({
      user: {
        id: "1",
        name: "João Silva",
        email: "joao@teste.com",
        userType: "PROFESSIONAL" as const,
        isEmailVerified: true,
      },
      isLoading: false,
      logout: jest.fn(),
    });

    render(<Sidebar />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/perfil profissional/i)).toBeInTheDocument();
    expect(screen.getByText(/agendamentos/i)).toBeInTheDocument();
    expect(screen.getByText(/solicitações/i)).toBeInTheDocument();
    expect(screen.getByText(/serviços oferecidos/i)).toBeInTheDocument();
    expect(screen.getByText(/clientes atendidos/i)).toBeInTheDocument();
    expect(screen.getByText(/financeiro/i)).toBeInTheDocument();
    expect(screen.getByText(/sair/i)).toBeInTheDocument();
  });
});
