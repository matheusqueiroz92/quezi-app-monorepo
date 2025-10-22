import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  reset: () => void;
}

export interface UsePaginationReturn
  extends PaginationState,
    PaginationActions {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Hook para gerenciar paginação
 *
 * @param initialPage - Página inicial (padrão: 1)
 * @param initialPageSize - Tamanho inicial da página (padrão: 10)
 *
 * @example
 * const pagination = usePagination(1, 20);
 *
 * // Fazer requisição
 * const { data } = await fetchUsers({
 *   page: pagination.currentPage,
 *   limit: pagination.pageSize,
 * });
 *
 * pagination.setTotalItems(data.total);
 */
export function usePagination(
  initialPage: number = 1,
  initialPageSize: number = 10
): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  // Verificar se há próxima página
  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  // Verificar se há página anterior
  const hasPreviousPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  // Calcular índices de início e fim para a página atual
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);

  // Ir para uma página específica
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // Próxima página
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  // Página anterior
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  // Mudar tamanho da página
  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  // Reset paginação
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalItems(0);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
    setTotalItems,
    reset,
  };
}
