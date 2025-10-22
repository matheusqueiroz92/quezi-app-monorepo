/**
 * Testes para hook useLocalStorage
 * Testa sincronização com localStorage e persistência de dados
 */

import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../useLocalStorage";

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("deve inicializar com valor padrão quando localStorage está vazio", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    expect(result.current[0]).toBe("default-value");
    expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key");
  });

  it("deve carregar valor do localStorage quando existe", () => {
    localStorageMock.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    expect(result.current[0]).toBe("stored-value");
  });

  it("deve atualizar localStorage quando valor muda", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify("new-value")
    );
  });

  it("deve funcionar com objetos complexos", () => {
    const initialValue = { name: "Maria", age: 30 };
    const { result } = renderHook(() =>
      useLocalStorage("user-data", initialValue)
    );

    expect(result.current[0]).toEqual(initialValue);

    const newValue = { name: "João", age: 25 };
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "user-data",
      JSON.stringify(newValue)
    );
  });

  it("deve funcionar com arrays", () => {
    const initialValue = [1, 2, 3];
    const { result } = renderHook(() =>
      useLocalStorage("numbers", initialValue)
    );

    expect(result.current[0]).toEqual(initialValue);

    const newValue = [4, 5, 6];
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
  });

  it("deve lidar com JSON inválido no localStorage", () => {
    localStorageMock.setItem("test-key", "invalid-json");

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    expect(result.current[0]).toBe("default-value");
  });

  it("deve permitir limpar valor", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");

    act(() => {
      result.current[2](); // clear function
    });

    expect(result.current[0]).toBe("default-value");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("test-key");
  });

  it("deve manter estado entre re-renders", () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage("test-key", "default-value")
    );

    act(() => {
      result.current[1]("persistent-value");
    });

    rerender();

    expect(result.current[0]).toBe("persistent-value");
  });

  it("deve funcionar com undefined como valor padrão", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", undefined));

    expect(result.current[0]).toBeUndefined();

    act(() => {
      result.current[1]("defined-value");
    });

    expect(result.current[0]).toBe("defined-value");
  });

  it("deve funcionar com null como valor padrão", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", null));

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]("not-null-value");
    });

    expect(result.current[0]).toBe("not-null-value");
  });
});
