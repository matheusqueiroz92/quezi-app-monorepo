import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  className?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Componente de estado vazio elegante
 *
 * Usado quando não há dados para exibir em uma lista, tabela, etc.
 */
export function EmptyState({
  className,
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 p-6 rounded-full bg-accent-blush">
          <Icon className="w-12 h-12 text-marsala" />
        </div>
      )}

      <h3 className="text-xl font-display font-semibold text-neutral-graphite mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-neutral-graphite/70 max-w-md mb-6">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-marsala hover:bg-marsala-dark text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
