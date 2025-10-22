import { render, screen } from "@testing-library/react";
import { Logo } from "../Logo";

describe("Logo Component", () => {
  it("deve renderizar logo padrão", () => {
    render(<Logo />);
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve renderizar logo com tamanho pequeno", () => {
    render(<Logo size="sm" />);
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve renderizar logo com tamanho médio", () => {
    render(<Logo size="md" />);
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve renderizar logo com tamanho grande", () => {
    render(<Logo size="lg" />);
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve renderizar logo com tamanho extra grande", () => {
    render(<Logo size="xl" />);
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve renderizar logo como link quando href for fornecido", () => {
    render(<Logo href="/home" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/home");
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve renderizar logo sem link quando href não for fornecido", () => {
    render(<Logo />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    render(<Logo className="custom-logo" />);
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });

  it("deve renderizar com todas as props", () => {
    render(<Logo size="lg" href="/dashboard" className="custom-class" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("uezi")).toBeInTheDocument();
  });
});
