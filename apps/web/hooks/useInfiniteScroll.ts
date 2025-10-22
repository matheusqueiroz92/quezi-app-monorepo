import { useEffect, useRef, useCallback, useState } from "react";

export interface UseInfiniteScrollOptions {
  threshold?: number; // Distância do fim (em pixels) para disparar callback
  rootMargin?: string; // Margem ao redor do elemento root
  enabled?: boolean; // Se o infinite scroll está ativo
}

/**
 * Hook para implementar scroll infinito
 *
 * @param callback - Função a ser chamada quando o usuário chegar perto do fim
 * @param options - Opções de configuração
 *
 * @example
 * const { observerRef, isLoading, setIsLoading } = useInfiniteScroll(
 *   async () => {
 *     setIsLoading(true);
 *     await fetchMoreData();
 *     setIsLoading(false);
 *   },
 *   { threshold: 200 }
 * );
 *
 * return (
 *   <div>
 *     {items.map(item => <ItemCard key={item.id} {...item} />)}
 *     <div ref={observerRef} />
 *     {isLoading && <Loader />}
 *   </div>
 * );
 */
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 100, rootMargin = "0px", enabled = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  // Atualizar callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Callback para o IntersectionObserver
  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && enabled && !isLoading) {
        setIsLoading(true);

        try {
          await callbackRef.current();
        } catch (error) {
          console.error("Error in infinite scroll callback:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [enabled, isLoading]
  );

  // Configurar IntersectionObserver
  useEffect(() => {
    const element = observerRef.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin,
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver, rootMargin, enabled]);

  return {
    observerRef,
    isLoading,
    setIsLoading,
  };
}

/**
 * Hook alternativo usando scroll event (fallback para navegadores antigos)
 */
export function useInfiniteScrollLegacy(
  callback: () => void | Promise<void>,
  threshold: number = 100
) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(async () => {
    if (isFetching) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setIsFetching(true);
      setIsLoading(true);

      try {
        await callback();
      } catch (error) {
        console.error("Error in infinite scroll callback:", error);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [callback, threshold, isFetching]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return {
    isLoading,
    setIsLoading,
  };
}
