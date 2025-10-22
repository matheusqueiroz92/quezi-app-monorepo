import { render, screen } from "@testing-library/react";
import ProfessionalLayout from "../layout";

// Mock do useAuth
const mockUseAuth = {
  user: {
    id: "1",
    name: "João Silva",
    email: "joao@teste.com",
    userType: "PROFESSIONAL" as const,
    isEmailVerified: true,
  },
  isLoading: false,
  getProfile: jest.fn().mockResolvedValue(undefined),
};

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth,
}));

// Mock dos componentes de layout
jest.mock("@/components/layout/Sidebar", () => ({
  Sidebar: () => (
    <div data-testid="professional-sidebar">Professional Sidebar</div>
  ),
}));

jest.mock("@/components/layout/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

describe("ProfessionalLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o layout do profissional", () => {
    render(
      <ProfessionalLayout>
        <div data-testid="professional-content">Professional Content</div>
      </ProfessionalLayout>
    );

    expect(screen.getByTestId("professional-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("professional-content")).toBeInTheDocument();
  });

  it("deve ter estrutura de layout correta", () => {
    render(
      <ProfessionalLayout>
        <div data-testid="professional-content">Professional Content</div>
      </ProfessionalLayout>
    );

    // Verifica se os componentes estão renderizados
    expect(screen.getByTestId("professional-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("professional-content")).toBeInTheDocument();
  });

  it("deve renderizar sidebar e conteúdo principal", () => {
    render(
      <ProfessionalLayout>
        <div data-testid="professional-content">Professional Content</div>
      </ProfessionalLayout>
    );

    expect(screen.getByTestId("professional-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("deve renderizar children corretamente", () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <ProfessionalLayout>
        <TestChild />
      </ProfessionalLayout>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });
});
