/**
 * Testes para hook useDebounce
 * Testa delay e cancelamento de valores
 */

import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("deve retornar valor inicial imediatamente", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("deve debounce valor com delay padrão", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Mudar valor
    rerender({ value: "changed", delay: 500 });

    // Valor ainda deve ser o anterior
    expect(result.current).toBe("initial");

    // Avançar tempo
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Agora deve ter o novo valor
    expect(result.current).toBe("changed");
  });

  it("deve cancelar debounce anterior quando valor muda rapidamente", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Mudar valor múltiplas vezes rapidamente
    rerender({ value: "first", delay: 500 });
    rerender({ value: "second", delay: 500 });
    rerender({ value: "final", delay: 500 });

    // Avançar tempo
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Deve ter apenas o último valor
    expect(result.current).toBe("final");
  });

  it("deve funcionar com delay customizado", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 1000 },
      }
    );

    rerender({ value: "changed", delay: 1000 });

    // Avançar apenas 500ms (não deve ter mudado)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("initial");

    // Avançar mais 500ms (deve ter mudado)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("changed");
  });

  it("deve funcionar com delay de 0", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 0 },
      }
    );

    rerender({ value: "changed", delay: 0 });

    // Com delay 0, deve mudar imediatamente após o próximo tick
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current).toBe("changed");
  });

  it("deve funcionar com valores primitivos", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 100 },
      }
    );

    rerender({ value: 1, delay: 100 });
    rerender({ value: 2, delay: 100 });
    rerender({ value: 3, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(3);
  });

  it("deve funcionar com objetos", () => {
    const initialObj = { name: "initial" };
    const changedObj = { name: "changed" };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 100 },
      }
    );

    rerender({ value: changedObj, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toEqual(changedObj);
  });

  it("deve funcionar com arrays", () => {
    const initialArray = [1, 2, 3];
    const changedArray = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialArray, delay: 100 },
      }
    );

    rerender({ value: changedArray, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toEqual(changedArray);
  });

  it("deve limpar timer na desmontagem", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const { unmount } = renderHook(() => useDebounce("value", 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("deve funcionar com undefined e null", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: undefined, delay: 100 },
      }
    );

    rerender({ value: null, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBeNull();
  });
});
