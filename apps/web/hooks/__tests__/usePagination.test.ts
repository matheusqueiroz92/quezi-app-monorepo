/**
 * Testes completos para hook usePagination
 */

import { renderHook, act } from "@testing-library/react";
import { usePagination } from "../usePagination";

describe("usePagination Hook", () => {
  it("deve inicializar com valores padrão", () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
  });

  it("deve inicializar com valores customizados", () => {
    const { result } = renderHook(() => usePagination(3, 20));

    expect(result.current.currentPage).toBe(3);
    expect(result.current.pageSize).toBe(20);
  });

  it("deve calcular totalPages corretamente", () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.setTotalItems(25);
    });

    expect(result.current.totalPages).toBe(3); // 25 items / 10 per page = 3 pages
  });

  it("deve calcular hasNextPage corretamente", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    // Sem items
    expect(result.current.hasNextPage).toBe(false);

    // Com items suficientes
    act(() => {
      result.current.setTotalItems(25);
    });

    expect(result.current.hasNextPage).toBe(true);

    // Na última página
    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it("deve calcular hasPreviousPage corretamente", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    // Primeira página
    expect(result.current.hasPreviousPage).toBe(false);

    // Definir total de itens para permitir navegação
    act(() => {
      result.current.setTotalItems(25);
    });

    // Segunda página
    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.hasPreviousPage).toBe(true);
  });

  it("deve calcular startIndex e endIndex corretamente", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(25);
    });

    // Primeira página (1-10)
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(10);

    // Segunda página (11-20)
    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.startIndex).toBe(10);
    expect(result.current.endIndex).toBe(20);

    // Terceira página (21-25)
    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.startIndex).toBe(20);
    expect(result.current.endIndex).toBe(25);
  });

  it("deve navegar para página específica", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(30);
    });

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("não deve navegar para página inválida", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(30);
      result.current.goToPage(5); // Página inexistente
    });

    expect(result.current.currentPage).toBe(1); // Deve permanecer na página 1
  });

  it("deve ir para próxima página", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(30);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("não deve ir para próxima página quando já estiver na última", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(10);
      result.current.goToPage(1);
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("deve ir para página anterior", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(30);
    });

    act(() => {
      result.current.goToPage(3);
    });

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("não deve ir para página anterior quando já estiver na primeira", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("deve mudar tamanho da página e resetar para primeira página", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(30);
      result.current.goToPage(2);
      result.current.setPageSize(20);
    });

    expect(result.current.pageSize).toBe(20);
    expect(result.current.currentPage).toBe(1); // Deve resetar para primeira página
  });

  it("deve resetar paginação", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(30);
      result.current.goToPage(3);
      result.current.setPageSize(20);
      result.current.reset();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalItems).toBe(0);
  });

  it("deve resetar para valores iniciais customizados", () => {
    const { result } = renderHook(() => usePagination(3, 20));

    act(() => {
      result.current.setTotalItems(100);
      result.current.goToPage(5);
      result.current.reset();
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.totalItems).toBe(0);
  });

  it("deve recalcular índices quando pageSize mudar", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(30);
      result.current.setPageSize(15);
    });

    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(15);
    expect(result.current.totalPages).toBe(2);
  });

  it("deve lidar com totalItems zero", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
  });

  it("deve lidar com totalItems menor que pageSize", () => {
    const { result } = renderHook(() => usePagination(1, 10));

    act(() => {
      result.current.setTotalItems(5);
    });

    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(5);
  });
});
