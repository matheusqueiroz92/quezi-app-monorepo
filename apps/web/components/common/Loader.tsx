import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  variant?: "spinner" | "dots" | "pulse";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

/**
 * Componente de Loading elegante e suave
 *
 * @param size - Tamanho do loader
 * @param text - Texto opcional a ser exibido
 * @param variant - Variação do loader (spinner, dots, pulse)
 */
export function Loader({
  className,
  size = "md",
  text,
  variant = "spinner",
}: LoaderProps) {
  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <Loader2
          className={cn("animate-spin text-marsala", sizeClasses[size])}
        />
        {text && (
          <p className="text-sm text-neutral-graphite animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-marsala rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        {text && <p className="text-sm text-neutral-graphite">{text}</p>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
      >
        <div
          className={cn(
            "bg-marsala rounded-full animate-pulse",
            sizeClasses[size]
          )}
        />
        {text && <p className="text-sm text-neutral-graphite">{text}</p>}
      </div>
    );
  }

  return null;
}

/**
 * Loader de página inteira (fullscreen)
 */
export function FullPageLoader({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader size="lg" text={text} />
    </div>
  );
}

/**
 * Skeleton loader para cards e conteúdo
 */
export function Skeleton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "avatar" | "text";
}) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-pearl rounded",
        variant === "avatar" && "rounded-full",
        variant === "text" && "h-4 rounded",
        className
      )}
    />
  );
}
