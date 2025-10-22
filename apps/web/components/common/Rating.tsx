import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  className?: string;
  value: number; // 0 a 5
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showCount?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

/**
 * Componente de Avaliação (Rating) com estrelas douradas
 *
 * @param value - Valor da avaliação (0-5)
 * @param interactive - Se pode ser editado/clicado
 * @param showValue - Exibir valor numérico
 * @param showCount - Exibir quantidade de avaliações
 */
export function Rating({
  className,
  value,
  maxStars = 5,
  size = "md",
  showValue = false,
  showCount = false,
  reviewCount = 0,
  interactive = false,
  onChange,
}: RatingProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Estrelas */}
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = star <= value;
          const partial = star > value && star - 1 < value;
          const partialPercentage = partial ? (value % 1) * 100 : 0;

          return (
            <div
              key={star}
              className={cn(
                "relative",
                interactive &&
                  "cursor-pointer transition-transform hover:scale-110"
              )}
              onClick={() => handleClick(star)}
            >
              {/* Estrela de fundo (cinza) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-neutral-medium fill-neutral-medium"
                )}
              />

              {/* Estrela preenchida (dourada) */}
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    width: partial ? `${partialPercentage}%` : "100%",
                  }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      "text-dourado fill-dourado"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Valor numérico */}
      {showValue && (
        <span className="text-sm font-semibold text-neutral-graphite">
          {value.toFixed(1)}
        </span>
      )}

      {/* Contagem de avaliações */}
      {showCount && reviewCount > 0 && (
        <span className="text-sm text-neutral-graphite/70">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

/**
 * Rating simplificado para exibição rápida
 */
export function RatingSimple({
  value,
  reviewCount,
}: {
  value: number;
  reviewCount: number;
}) {
  return (
    <Rating
      value={value}
      size="sm"
      showValue
      showCount={!!reviewCount}
      reviewCount={reviewCount ?? 0}
    />
  );
}
