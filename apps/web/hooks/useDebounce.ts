import { useEffect, useState } from "react";

/**
 * Hook para debounce de valores
 *
 * Útil para inputs de busca, onde queremos esperar o usuário parar de digitar
 * antes de fazer a requisição.
 *
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 500ms)
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Fazer requisição de busca
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Criar o timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar o timer se o valor mudar antes do delay
    return () => {
      try {
        clearTimeout(timer);
      } catch (error) {
        // Ignorar erros de clearTimeout em testes com fake timers
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
