import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

/**
 * Barra de busca elegante e responsiva
 */
export function SearchBar({
  className,
  placeholder = "Buscar...",
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  showClearButton = true,
  autoFocus = false,
  disabled = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  const handleClear = () => {
    const newValue = "";

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
    onClear?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(value);
    }
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Ícone de busca */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite pointer-events-none" />

      {/* Input */}
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        disabled={disabled}
        className={cn(
          "pl-10 pr-10 h-12 rounded-quezi-lg",
          "border-neutral-medium focus:border-marsala focus:ring-marsala",
          "placeholder:text-neutral-graphite/50",
          "transition-all duration-200"
        )}
      />

      {/* Botão de limpar */}
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-neutral-pearl"
        >
          <X className="w-4 h-4 text-neutral-graphite" />
        </Button>
      )}
    </div>
  );
}
