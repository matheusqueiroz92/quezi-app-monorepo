import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface PageHeaderProps {
  className?: string;
  title: string;
  subtitle?: string;
  description?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
}

/**
 * Componente de cabeçalho de página padrão
 *
 * Inclui título, descrição opcional, botão de voltar e área de ações
 */
export function PageHeader({
  className,
  title,
  subtitle,
  description,
  showBackButton = false,
  backButtonHref,
  actions,
  breadcrumbs,
  children,
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

          {subtitle && (
            <h2 className="text-xl font-display font-semibold text-marsala mb-2">
              {subtitle}
            </h2>
          )}

          {description && (
            <p className="text-base text-neutral-graphite">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {children && <div className="mt-4">{children}</div>}

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-neutral-graphite">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <a
                href={breadcrumb.href}
                className="hover:text-marsala transition-colors"
              >
                {breadcrumb.label}
              </a>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
