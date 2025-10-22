import { render, screen } from "@testing-library/react";
import { Header } from "../Header";

// Mock do useAuth
const mockUseAuth = {
  user: {
    id: "1",
    name: "Maria Silva",
    email: "maria@teste.com",
    userType: "CLIENT" as const,
    isEmailVerified: true,
  },
  isLoading: false,
  logout: jest.fn(),
};

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth,
}));

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o header", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("deve renderizar notificações", () => {
    render(<Header />);
    expect(screen.getByLabelText(/notificações/i)).toBeInTheDocument();
  });

  it("deve renderizar configurações", () => {
    render(<Header />);
    expect(screen.getByLabelText(/configurações/i)).toBeInTheDocument();
  });

  it("deve ter classe CSS correta para header", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-white", "shadow-sm", "border-b");
  });

  it("deve renderizar avatar do usuário", () => {
    render(<Header />);
    expect(screen.getByText("MS")).toBeInTheDocument(); // Iniciais do nome
  });
});
