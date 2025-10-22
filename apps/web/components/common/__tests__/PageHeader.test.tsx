import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";

describe("PageHeader Component", () => {
  it("deve renderizar título", () => {
    render(<PageHeader title="Meu Título" />);
    expect(screen.getByText("Meu Título")).toBeInTheDocument();
  });

  it("deve renderizar subtítulo quando fornecido", () => {
    render(<PageHeader title="Meu Título" subtitle="Meu Subtítulo" />);
    expect(screen.getByText("Meu Subtítulo")).toBeInTheDocument();
  });

  it("deve renderizar descrição quando fornecida", () => {
    render(<PageHeader title="Meu Título" description="Minha descrição" />);
    expect(screen.getByText("Minha descrição")).toBeInTheDocument();
  });

  it("deve renderizar children quando fornecidos", () => {
    render(
      <PageHeader title="Meu Título">
        <button>Botão de ação</button>
      </PageHeader>
    );
    expect(screen.getByText("Botão de ação")).toBeInTheDocument();
  });

  it("deve renderizar breadcrumbs quando fornecidos", () => {
    const breadcrumbs = [
      { label: "Home", href: "/" },
      { label: "Página", href: "/pagina" },
    ];
    render(<PageHeader title="Meu Título" breadcrumbs={breadcrumbs} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Página")).toBeInTheDocument();
  });

  it("deve renderizar com todas as props", () => {
    const breadcrumbs = [{ label: "Home", href: "/" }];
    render(
      <PageHeader
        title="Meu Título"
        subtitle="Meu Subtítulo"
        description="Minha descrição"
        breadcrumbs={breadcrumbs}
        className="custom-class"
      >
        <button>Botão</button>
      </PageHeader>
    );

    expect(screen.getByText("Meu Título")).toBeInTheDocument();
    expect(screen.getByText("Meu Subtítulo")).toBeInTheDocument();
    expect(screen.getByText("Minha descrição")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Botão")).toBeInTheDocument();
  });

  it("deve renderizar corretamente sem props opcionais", () => {
    render(<PageHeader title="Apenas Título" />);
    expect(screen.getByText("Apenas Título")).toBeInTheDocument();
  });
});
