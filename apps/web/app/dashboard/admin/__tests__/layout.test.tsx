import { render, screen } from "@testing-library/react";
import AdminLayout from "../layout";

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
  getProfile: jest.fn().mockResolvedValue(undefined),
};

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth,
}));

// Mock dos componentes de layout
jest.mock("@/components/layout/AdminSidebar", () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}));

jest.mock("@/components/layout/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o layout administrativo", () => {
    render(
      <AdminLayout>
        <div data-testid="admin-content">Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("deve ter estrutura de layout correta", () => {
    render(
      <AdminLayout>
        <div data-testid="admin-content">Admin Content</div>
      </AdminLayout>
    );

    // Verifica se os componentes estão renderizados
    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("deve renderizar sidebar e conteúdo principal", () => {
    render(
      <AdminLayout>
        <div data-testid="admin-content">Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("deve renderizar children corretamente", () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <AdminLayout>
        <TestChild />
      </AdminLayout>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });
});
