/**
 * TDD - Testes para o AuthLayout
 * Framework: Jest + React Testing Library
 */

import { render } from "@testing-library/react";
import AuthLayout from "../layout";

describe("AuthLayout", () => {
  it("deve renderizar children corretamente", () => {
    // Arrange
    const TestChild = () => <div data-testid="auth-child">Auth Content</div>;

    // Act
    const { getByTestId } = render(
      <AuthLayout>
        <TestChild />
      </AuthLayout>
    );

    // Assert
    expect(getByTestId("auth-child")).toBeInTheDocument();
    expect(getByTestId("auth-child")).toHaveTextContent("Auth Content");
  });

  it("deve renderizar múltiplos children", () => {
    // Arrange
    const Child1 = () => <div data-testid="auth-child-1">Auth Child 1</div>;
    const Child2 = () => <div data-testid="auth-child-2">Auth Child 2</div>;

    // Act
    const { getByTestId } = render(
      <AuthLayout>
        <Child1 />
        <Child2 />
      </AuthLayout>
    );

    // Assert
    expect(getByTestId("auth-child-1")).toBeInTheDocument();
    expect(getByTestId("auth-child-2")).toBeInTheDocument();
  });

  it("deve renderizar sem wrapper adicional", () => {
    // Arrange
    const TestChild = () => <div data-testid="direct-child">Direct Child</div>;

    // Act
    const { container, getByTestId } = render(
      <AuthLayout>
        <TestChild />
      </AuthLayout>
    );

    // Assert
    expect(getByTestId("direct-child")).toBeInTheDocument();
    // AuthLayout não adiciona nenhum wrapper, apenas retorna children
    expect(container.firstChild).toBe(getByTestId("direct-child"));
  });

  it("deve aceitar children vazios", () => {
    // Arrange & Act
    const { container } = render(<AuthLayout>{null}</AuthLayout>);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it("deve aceitar children como string", () => {
    // Arrange & Act
    const { getByText } = render(<AuthLayout>String Child</AuthLayout>);

    // Assert
    expect(getByText("String Child")).toBeInTheDocument();
  });

  it("deve aceitar children como número", () => {
    // Arrange & Act
    const { getByText } = render(<AuthLayout>{42}</AuthLayout>);

    // Assert
    expect(getByText("42")).toBeInTheDocument();
  });
});
