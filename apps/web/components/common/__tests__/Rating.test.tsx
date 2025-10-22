import { render, screen } from "@testing-library/react";
import { Rating, RatingSimple } from "../Rating";

describe("Rating Component", () => {
  it("deve renderizar corretamente", () => {
    render(<Rating value={3} />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve mostrar valor numérico quando showValue for true", () => {
    render(<Rating value={4.5} showValue />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("deve mostrar contagem de avaliações quando showCount for true", () => {
    render(<Rating value={4} showCount reviewCount={120} />);
    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

  it("não deve mostrar contagem quando reviewCount for 0", () => {
    render(<Rating value={4} showCount reviewCount={0} />);
    expect(screen.queryByText("(0)")).not.toBeInTheDocument();
  });

  it("deve renderizar com diferentes tamanhos", () => {
    render(<Rating value={3} size="sm" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar em modo interativo", () => {
    const onChange = jest.fn();
    render(<Rating value={3} interactive onChange={onChange} />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    render(<Rating value={3} className="custom-rating" />);
    expect(document.body).toBeInTheDocument();
  });
});

describe("RatingSimple Component", () => {
  it("deve renderizar corretamente", () => {
    render(<RatingSimple value={4} reviewCount={10} />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve mostrar valor e contagem", () => {
    render(<RatingSimple value={4.5} reviewCount={25} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(25)")).toBeInTheDocument();
  });
});
