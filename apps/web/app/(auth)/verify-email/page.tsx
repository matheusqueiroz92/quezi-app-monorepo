"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { post, getErrorMessage } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token de verificação não encontrado");
      setIsVerifying(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await post(`/auth/verify-email`, { token });

        setIsVerified(true);
        setIsVerifying(false);

        toast({
          title: "Email verificado!",
          description: "Sua conta foi ativada com sucesso.",
        });

        // Redirecionar após 3s
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setIsVerifying(false);

        toast({
          title: "Erro na verificação",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [token, router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-quezi-lg shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {/* Loading State */}
          {isVerifying && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex justify-center">
                <div className="p-4 bg-accent-blush rounded-full">
                  <Loader2 className="w-12 h-12 text-marsala animate-spin" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-display font-bold text-marsala mb-2">
                  Verificando seu email...
                </h1>
                <p className="text-neutral-graphite">
                  Por favor, aguarde enquanto confirmamos sua conta.
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {!isVerifying && isVerified && (
            <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-500">
              <div className="flex justify-center">
                <div className="p-4 bg-green-50 rounded-full animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-display font-bold text-marsala mb-2">
                  Email Verificado!
                </h1>
                <p className="text-neutral-graphite mb-4">
                  Sua conta foi ativada com sucesso. Redirecionando para o
                  login...
                </p>

                <div className="w-full h-1 bg-neutral-pearl rounded-full overflow-hidden">
                  <div className="h-full bg-marsala rounded-full animate-[loading_3s_ease-in-out]"></div>
                </div>
              </div>

              <Link href="/login">
                <Button className="w-full bg-marsala hover:bg-marsala-dark">
                  Ir para Login
                </Button>
              </Link>
            </div>
          )}

          {/* Error State */}
          {!isVerifying && error && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex justify-center">
                <div className="p-4 bg-red-50 rounded-full">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-display font-bold text-marsala mb-2">
                  Erro na Verificação
                </h1>
                <p className="text-neutral-graphite mb-4">{error}</p>
              </div>

              <div className="space-y-3">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-marsala text-marsala hover:bg-accent-blush"
                  >
                    Ir para Login
                  </Button>
                </Link>

                <Button
                  onClick={() => router.push("/")}
                  className="w-full bg-marsala hover:bg-marsala-dark"
                >
                  Voltar para Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
