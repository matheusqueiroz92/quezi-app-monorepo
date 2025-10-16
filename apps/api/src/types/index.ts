/**
 * Tipos personalizados da aplicação
 */

/**
 * Tipo para respostas de erro padronizadas
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Tipo para respostas de sucesso paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
