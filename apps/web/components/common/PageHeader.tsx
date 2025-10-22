import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  className?: string;
  title: string;
  description?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  actions?: React.ReactNode;
}

/**
 * Componente de cabeçalho de página padrão
 *
 * Inclui título, descrição opcional, botão de voltar e área de ações
 */
export function PageHeader({
  className,
  title,
  description,
  showBackButton = false,
  backButtonHref,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 mb-8 pb-6 border-b border-neutral-medium",
        className
      )}
    >
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="w-fit -ml-2 text-neutral-graphite hover:text-marsala"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-marsala mb-2">
            {title}
          </h1>

          {description && (
            <p className="text-base text-neutral-graphite">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
