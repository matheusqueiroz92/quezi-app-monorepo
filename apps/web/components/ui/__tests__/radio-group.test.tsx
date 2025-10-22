/**
 * TDD - Testes para o componente RadioGroup
 * Framework: Jest + React Testing Library
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "../radio-group";

describe("RadioGroup Component", () => {
  it("deve renderizar radio group com opções", () => {
    // Arrange & Act
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>
    );

    // Assert
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(2);
  });

  it("deve permitir seleção de opção", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>
    );

    // Act
    const firstRadio = screen.getAllByRole("radio")[0];
    await user.click(firstRadio);

    // Assert
    expect(firstRadio).toBeChecked();
  });

  it("deve aceitar valor padrão", () => {
    // Arrange & Act
    render(
      <RadioGroup defaultValue="option2">
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>
    );

    // Assert
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons[1]).toBeChecked();
  });

  it("deve aceitar className personalizada", () => {
    // Arrange & Act
    render(
      <RadioGroup className="custom-radio-group">
        <RadioGroupItem value="option1" id="option1" />
      </RadioGroup>
    );

    // Assert
    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveClass("custom-radio-group");
  });

  it("deve renderizar radio group desabilitado", () => {
    // Arrange & Act
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>
    );

    // Assert
    const radioButtons = screen.getAllByRole("radio");
    radioButtons.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it("deve renderizar radio group item com label", () => {
    // Arrange & Act
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1">Opção 1</label>
      </RadioGroup>
    );

    // Assert
    expect(screen.getByLabelText("Opção 1")).toBeInTheDocument();
  });

  it("deve permitir mudança de seleção", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>
    );

    // Act
    const firstRadio = screen.getAllByRole("radio")[0];
    const secondRadio = screen.getAllByRole("radio")[1];

    expect(firstRadio).toBeChecked();

    await user.click(secondRadio);

    // Assert
    expect(firstRadio).not.toBeChecked();
    expect(secondRadio).toBeChecked();
  });

  it("deve aceitar props adicionais", () => {
    // Arrange & Act
    render(
      <RadioGroup data-testid="custom-radio-group">
        <RadioGroupItem value="option1" id="option1" />
      </RadioGroup>
    );

    // Assert
    expect(screen.getByTestId("custom-radio-group")).toBeInTheDocument();
  });
});
