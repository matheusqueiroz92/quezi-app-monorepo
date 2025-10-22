"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { post, getErrorMessage } from "@/lib/api-client";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);

    try {
      await post("/admin/auth/forgot-password", data);

      setEmailSent(true);

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      toast({
        title: "Erro ao enviar email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-quezi-lg shadow-lg p-8 text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-50 rounded-full">
                <Mail className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-display font-bold text-marsala mb-3">
              Email Enviado!
            </h1>

            <p className="text-neutral-graphite mb-6">
              Enviamos um link para redefinir sua senha. Verifique sua caixa de
              entrada e siga as instruções.
            </p>

            <Link href="/admin/login">
              <Button className="w-full bg-marsala hover:bg-marsala-dark">
                Voltar para Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-quezi-lg shadow-lg p-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {/* Botão Voltar */}
          <Link
            href="/admin/login"
            className="inline-flex items-center text-sm text-neutral-graphite hover:text-marsala transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para login
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-marsala mb-2">
              Esqueceu sua senha?
            </h1>
            <p className="text-neutral-graphite text-sm">
              Digite seu email e enviaremos um link para redefinir sua senha
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-marsala hover:bg-marsala-dark text-white font-semibold rounded-quezi"
            >
              {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
