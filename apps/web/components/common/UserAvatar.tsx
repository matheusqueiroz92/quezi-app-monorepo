import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  className?: string;
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showBorder?: boolean;
  borderColor?: "gold" | "marsala" | "neutral";
  fallbackIcon?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-24 h-24 text-2xl",
};

const borderColors = {
  gold: "ring-dourado",
  marsala: "ring-marsala",
  neutral: "ring-neutral-medium",
};

/**
 * Componente de Avatar de usuário
 *
 * Exibe foto do usuário ou iniciais do nome como fallback
 */
export function UserAvatar({
  className,
  src,
  alt = "Avatar do usuário",
  name,
  size = "md",
  showBorder = false,
  borderColor = "gold",
  fallbackIcon = false,
}: UserAvatarProps) {
  // Gera iniciais do nome
  const getInitials = (name?: string): string => {
    if (!name) return "?";

    const trimmed = name?.trim();
    if (!trimmed) return "?";

    const parts = trimmed.split(" ").filter(Boolean);

    if (parts.length === 0) return "?";
    if (parts.length === 1) {
      return parts[0]?.charAt(0)?.toUpperCase() || "?";
    }

    const firstInitial = parts[0]?.charAt(0)?.toUpperCase() || "?";
    const lastInitial =
      parts[parts.length - 1]?.charAt(0)?.toUpperCase() || "?";

    return `${firstInitial}${lastInitial}`;
  };

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        showBorder && `ring-2 ${borderColors[borderColor]}`,
        className
      )}
    >
      {src && <AvatarImage src={src} alt={alt} />}

      <AvatarFallback className="bg-marsala text-white font-semibold">
        {fallbackIcon ? <User className="w-1/2 h-1/2" /> : getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
