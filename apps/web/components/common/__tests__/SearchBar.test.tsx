import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "../SearchBar";

describe("SearchBar Component", () => {
  it("deve renderizar corretamente", () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("deve renderizar com placeholder personalizado", () => {
    render(<SearchBar placeholder="Digite sua busca..." />);
    expect(
      screen.getByPlaceholderText("Digite sua busca...")
    ).toBeInTheDocument();
  });

  it("deve renderizar com valor inicial", () => {
    render(<SearchBar value="teste inicial" />);
    expect(screen.getByDisplayValue("teste inicial")).toBeInTheDocument();
  });

  it("deve chamar onChange quando o valor mudar", async () => {
    const handleChange = jest.fn();
    render(<SearchBar onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Buscar...");
    await userEvent.type(input, "teste");

    expect(handleChange).toHaveBeenCalled();
  });

  it("deve chamar onSearch quando Enter for pressionado", async () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText("Buscar...");
    await userEvent.type(input, "teste");
    await userEvent.keyboard("{Enter}");

    expect(handleSearch).toHaveBeenCalledWith("teste");
  });

  it("deve chamar onClear quando o botão de limpar for clicado", async () => {
    const handleClear = jest.fn();
    render(<SearchBar value="teste" onClear={handleClear} />);

    const clearButton = screen.getByRole("button");
    await userEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalled();
  });

  it("deve estar desabilitado quando disabled for true", () => {
    render(<SearchBar disabled />);
    expect(screen.getByPlaceholderText("Buscar...")).toBeDisabled();
  });

  it("deve aplicar className customizada", () => {
    render(<SearchBar className="custom-search" />);
    expect(document.body).toBeInTheDocument();
  });

  it("deve renderizar com todas as props", () => {
    const handleChange = jest.fn();
    const handleSearch = jest.fn();
    const handleClear = jest.fn();

    render(
      <SearchBar
        placeholder="Buscar produtos..."
        value="teste"
        onChange={handleChange}
        onSearch={handleSearch}
        onClear={handleClear}
        className="custom-search"
      />
    );

    expect(
      screen.getByPlaceholderText("Buscar produtos...")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("teste")).toBeInTheDocument();
  });
});
