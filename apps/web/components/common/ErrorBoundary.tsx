"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para capturar e exibir erros de forma elegante
 *
 * Obs: Error Boundaries precisam ser classes no React
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Aqui você pode enviar para um serviço de log (Sentry, etc)
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined as unknown as Error });
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado ou padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="mb-6 p-6 rounded-full bg-red-50">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>

          <h2 className="text-2xl font-display font-bold text-neutral-graphite mb-3">
            Ops! Algo deu errado
          </h2>

          <p className="text-neutral-graphite/70 mb-6 max-w-md">
            Encontramos um erro inesperado. Por favor, tente novamente ou entre
            em contato com o suporte se o problema persistir.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mb-6 p-4 bg-neutral-pearl rounded-quezi text-left text-xs overflow-auto max-w-2xl">
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          )}

          <div className="flex gap-3">
            <Button
              onClick={this.handleReset}
              className="bg-marsala hover:bg-marsala-dark text-white"
            >
              Tentar Novamente
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Voltar para Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
