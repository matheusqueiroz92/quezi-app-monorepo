"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { post, getErrorMessage } from "@/lib/api-client";
import { setAuthToken, redirectByRole } from "@/lib/auth-utils";
import { fadeInUp } from "@/lib/animations";

// Schema de validação
const adminLoginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginInput) => {
    setIsLoading(true);

    try {
      const response = await post<{ token: string }>("/admin/auth/login", data);

      // Salvar token
      setAuthToken(response.token, true);

      // Mostrar sucesso
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel administrativo...",
      });

      // Redirecionar após 500ms
      setTimeout(() => {
        redirectByRole();
      }, 500);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-quezi-lg shadow-lg p-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-marsala mb-2">
              Painel Administrativo
            </h1>
            <p className="text-neutral-graphite">
              Acesso exclusivo para administradores
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-graphite">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@quezi.com"
                  className="pl-10 h-12 rounded-quezi border-neutral-medium focus:border-marsala focus:ring-marsala"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-graphite">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 rounded-quezi border-neutral-medium focus:border-marsala focus:ring-marsala"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-graphite hover:text-marsala transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Esqueci minha senha */}
            <div className="text-right">
              <Link
                href="/admin/forgot-password"
                className="text-sm text-marsala hover:text-marsala-dark transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-marsala hover:bg-marsala-dark text-white font-semibold rounded-quezi transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Aviso de Segurança */}
          <div className="mt-8 p-4 bg-accent-blush rounded-quezi">
            <p className="text-xs text-center text-neutral-graphite">
              🔒 Acesso restrito. Todas as atividades são monitoradas e
              registradas.
            </p>
          </div>
        </div>

        {/* Link para login regular */}
        <div className="text-center mt-6">
          <p className="text-sm text-neutral-graphite">
            Não é administrador?{" "}
            <Link
              href="/login"
              className="text-marsala hover:text-marsala-dark font-semibold transition-colors"
            >
              Fazer login como usuário
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
