"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

export default function EmailVerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirecionar após 5 segundos
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-quezi-lg shadow-xl p-8 text-center animate-in fade-in-50 zoom-in-95 duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {/* Ícone de Sucesso */}
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-green-50 rounded-full animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-display font-bold text-marsala mb-3">
            Email Verificado!
          </h1>

          <p className="text-neutral-graphite mb-2">
            Sua conta foi ativada com sucesso.
          </p>

          <p className="text-sm text-neutral-graphite/70 mb-8">
            Agora você pode fazer login e começar a usar o Quezi!
          </p>

          {/* Botão CTA */}
          <Link href="/login">
            <Button className="w-full h-12 bg-marsala hover:bg-marsala-dark text-white font-semibold rounded-quezi shadow-md hover:shadow-lg transition-all group">
              Fazer Login
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          {/* Contador de redirecionamento */}
          <div className="mt-6">
            <p className="text-xs text-neutral-graphite/70 mb-2">
              Redirecionando automaticamente em 5 segundos...
            </p>
            <div className="w-full h-1 bg-neutral-pearl rounded-full overflow-hidden">
              <div className="h-full bg-marsala rounded-full animate-[loading_5s_linear]"></div>
            </div>
          </div>

          {/* Mensagem de boas-vindas */}
          <div className="mt-8 p-4 bg-gradient-to-r from-accent-blush to-accent-champagne rounded-quezi">
            <p className="text-sm text-marsala font-semibold">
              ✨ Bem-vinda à família Quezi!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
