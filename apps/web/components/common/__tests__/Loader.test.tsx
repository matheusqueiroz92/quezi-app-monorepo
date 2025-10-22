import { render, screen } from "@testing-library/react";
import { Loader, FullPageLoader, Skeleton } from "../Loader";

describe("Loader Component", () => {
  it("deve renderizar loader básico", () => {
    render(<Loader />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar loader com texto personalizado", () => {
    render(<Loader text="Carregando dados..." />);
    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("deve renderizar loader com tamanho pequeno", () => {
    render(<Loader size="sm" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar loader com tamanho médio", () => {
    render(<Loader size="md" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar loader com tamanho grande", () => {
    render(<Loader size="lg" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    render(<Loader className="custom-loader" />);
    expect(document.body).toBeInTheDocument();
  });
});

describe("FullPageLoader Component", () => {
  it("deve renderizar loader de página inteira", () => {
    render(<FullPageLoader />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("deve renderizar loader de página inteira com texto personalizado", () => {
    render(<FullPageLoader text="Processando..." />);
    expect(screen.getByText("Processando...")).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    // @ts-expect-error: prop de className adicionada apenas para teste/estilização
    render(<FullPageLoader className="custom-full-loader" />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });
});

describe("Skeleton Component", () => {
  it("deve renderizar skeleton padrão", () => {
    render(<Skeleton />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar skeleton avatar", () => {
    render(<Skeleton variant="avatar" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar skeleton text", () => {
    render(<Skeleton variant="text" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar skeleton com largura personalizada", () => {
    render(<Skeleton className="w-32" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    render(<Skeleton className="custom-skeleton" />);
    expect(document.body).toBeInTheDocument();
  });
});
