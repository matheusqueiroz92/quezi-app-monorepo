import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "../AdminSidebar";

// Mock do useAuth
const mockUseAuth = {
  user: {
    id: "1",
    name: "Admin User",
    email: "admin@teste.com",
    userType: "ADMIN" as const,
    isEmailVerified: true,
  },
  isLoading: false,
  logout: jest.fn(),
};

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth,
}));

describe("AdminSidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o sidebar administrativo", () => {
    render(<AdminSidebar />);
    expect(screen.getByText(/uezi/i)).toBeInTheDocument();
  });

  it("deve renderizar informações do admin", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("Admin User")).toBeInTheDocument();
  });

  it("deve renderizar itens do menu administrativo", () => {
    render(<AdminSidebar />);
    expect(screen.getByText(/dashboard geral/i)).toBeInTheDocument();
    expect(screen.getByText(/usuários/i)).toBeInTheDocument();
    expect(screen.getByText(/serviços cadastrados/i)).toBeInTheDocument();
    expect(screen.getByText(/financeiro/i)).toBeInTheDocument();
    expect(screen.getByText(/configurações/i)).toBeInTheDocument();
    expect(screen.getByText(/sair/i)).toBeInTheDocument();
  });

  it("deve renderizar avatar do admin com borda dourada", () => {
    render(<AdminSidebar />);
    const avatar = screen.getByText("AU"); // Iniciais do admin
    expect(avatar).toBeInTheDocument();
    expect(avatar.closest("div")).toHaveClass("border-gold");
  });

  it("deve ter classe CSS correta para sidebar admin", () => {
    render(<AdminSidebar />);
    const sidebar = screen.getByRole("navigation");
    expect(sidebar).toHaveClass("bg-white", "shadow-lg", "border-r");
  });
});
