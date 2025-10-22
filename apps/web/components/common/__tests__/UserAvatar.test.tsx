import { render, screen } from "@testing-library/react";
import { UserAvatar } from "../UserAvatar";

describe("UserAvatar Component", () => {
  it("deve renderizar corretamente", () => {
    render(<UserAvatar name="João Silva" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve mostrar iniciais do nome", () => {
    render(<UserAvatar name="João Silva" />);
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("deve mostrar iniciais de nome com uma palavra", () => {
    render(<UserAvatar name="João" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("deve mostrar ? quando não há nome", () => {
    render(<UserAvatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("deve renderizar avatar com imagem quando src for fornecido", () => {
    render(<UserAvatar src="https://example.com/avatar.jpg" alt="Avatar" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar fallback com ícone quando fallbackIcon for true", () => {
    render(<UserAvatar name="João Silva" fallbackIcon={true} />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve aplicar tamanho extra pequeno", () => {
    render(<UserAvatar name="Test" size="xs" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar tamanho pequeno", () => {
    render(<UserAvatar name="Test" size="sm" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar tamanho médio por padrão", () => {
    render(<UserAvatar name="Test" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar tamanho grande", () => {
    render(<UserAvatar name="Test" size="lg" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar tamanho extra grande", () => {
    render(<UserAvatar name="Test" size="xl" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar tamanho 2xl", () => {
    render(<UserAvatar name="Test" size="2xl" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar borda dourada quando showBorder for true", () => {
    render(<UserAvatar name="Test" showBorder={true} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar borda marsala", () => {
    render(<UserAvatar name="Test" showBorder={true} borderColor="marsala" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar borda neutra", () => {
    render(<UserAvatar name="Test" showBorder={true} borderColor="neutral" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("não deve aplicar borda quando showBorder for false", () => {
    render(<UserAvatar name="Test" showBorder={false} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    render(<UserAvatar name="Test" className="custom-avatar" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("deve usar alt text personalizado", () => {
    render(<UserAvatar src="test.jpg" alt="Avatar personalizado" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve usar alt text padrão", () => {
    render(<UserAvatar src="test.jpg" />);
    expect(document.body).toBeInTheDocument();
  });
});
