"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { post, getErrorMessage } from "@/lib/api-client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  // Validações visuais da senha
  const passwordValidations = {
    minLength: password?.length >= 8,
    hasUpperCase: /[A-Z]/.test(password || ""),
    hasLowerCase: /[a-z]/.test(password || ""),
    hasNumber: /[0-9]/.test(password || ""),
  };

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);

    try {
      await post(`/admin/auth/reset-password/${token}`, {
        password: data.password,
      });

      setResetSuccess(true);

      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Redirecionar após 2s
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      toast({
        title: "Erro ao redefinir senha",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-quezi-lg shadow-lg p-8 text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-50 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-display font-bold text-marsala mb-3">
              Senha Redefinida!
            </h1>

            <p className="text-neutral-graphite mb-6">
              Sua senha foi alterada com sucesso. Redirecionando para o login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-quezi-lg shadow-lg p-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-marsala mb-2">
              Redefinir Senha
            </h1>
            <p className="text-neutral-graphite text-sm">
              Crie uma nova senha segura
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-graphite">
                Nova Senha
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

              {/* Validações da senha */}
              <div className="space-y-1 mt-3">
                <p className="text-xs text-neutral-graphite font-semibold">
                  A senha deve conter:
                </p>
                <div className="space-y-1">
                  <div
                    className={`text-xs flex items-center gap-2 ${
                      passwordValidations.minLength
                        ? "text-green-600"
                        : "text-neutral-graphite"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidations.minLength
                          ? "bg-green-600"
                          : "bg-neutral-medium"
                      }`}
                    />
                    Mínimo de 8 caracteres
                  </div>
                  <div
                    className={`text-xs flex items-center gap-2 ${
                      passwordValidations.hasUpperCase
                        ? "text-green-600"
                        : "text-neutral-graphite"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidations.hasUpperCase
                          ? "bg-green-600"
                          : "bg-neutral-medium"
                      }`}
                    />
                    Uma letra maiúscula
                  </div>
                  <div
                    className={`text-xs flex items-center gap-2 ${
                      passwordValidations.hasLowerCase
                        ? "text-green-600"
                        : "text-neutral-graphite"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidations.hasLowerCase
                          ? "bg-green-600"
                          : "bg-neutral-medium"
                      }`}
                    />
                    Uma letra minúscula
                  </div>
                  <div
                    className={`text-xs flex items-center gap-2 ${
                      passwordValidations.hasNumber
                        ? "text-green-600"
                        : "text-neutral-graphite"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidations.hasNumber
                          ? "bg-green-600"
                          : "bg-neutral-medium"
                      }`}
                    />
                    Um número
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-neutral-graphite"
              >
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 rounded-quezi border-neutral-medium focus:border-marsala focus:ring-marsala"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-graphite hover:text-marsala transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-marsala hover:bg-marsala-dark text-white font-semibold rounded-quezi"
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>

          {/* Link para login */}
          <div className="mt-6 text-center">
            <Link
              href="/admin/login"
              className="text-sm text-marsala hover:text-marsala-dark transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
