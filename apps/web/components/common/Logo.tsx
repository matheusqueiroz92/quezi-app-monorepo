import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  href?: string;
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

/**
 * Componente Logo da aplicação Quezi
 *
 * @param size - Tamanho do logo (sm, md, lg, xl)
 * @param withText - Exibir texto junto ao logo
 * @param href - Link de navegação (opcional)
 */
export function Logo({
  className,
  size = "md",
  withText = true,
  href,
}: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Ícone/Símbolo do Logo */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-marsala to-marsala-dark",
          "text-white font-display font-bold",
          sizeClasses[size]
        )}
      >
        Q
      </div>

      {/* Texto do Logo */}
      {withText && (
        <span
          className={cn(
            "font-display font-bold text-marsala",
            sizeClasses[size]
          )}
        >
          uezi
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex transition-opacity hover:opacity-80"
      >
        {content}
      </Link>
    );
  }

  return content;
}
