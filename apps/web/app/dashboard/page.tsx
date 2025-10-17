"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, getProfile, logout, isLoading } = useAuth();

  useEffect(() => {
    // Carrega perfil do usuário ao montar
    getProfile().catch(() => {
      // Redireciona para login se não autenticado (já tratado no hook)
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne to-accent-blush">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-marsala border-t-transparent mx-auto mb-4" />
          <p className="text-neutral-graphite">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecionando para login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-champagne to-accent-blush p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-marsala mb-2">
              Olá, {user.name}! 👋
            </h1>
            <p className="text-neutral-graphite">
              {user.userType === "CLIENT"
                ? "Pronta para agendar um serviço?"
                : "Gerencie seus serviços e agendamentos"}
            </p>
          </div>

          <Button onClick={logout} variant="outline">
            Sair
          </Button>
        </div>

        {/* Cards de informação */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Suas informações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-neutral-graphite">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-graphite">Tipo</p>
                <p className="font-medium">
                  {user.userType === "CLIENT" ? "Cliente" : "Profissional"}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-graphite">Email verificado</p>
                <p className="font-medium">
                  {user.isEmailVerified ? "✅ Sim" : "⚠️ Não"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Gerencie suas organizações</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-marsala hover:bg-marsala-dark">
                Ver Organizações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Início Rápido</CardTitle>
              <CardDescription>Próximos passos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.userType === "PROFESSIONAL" ? (
                <>
                  <p className="text-sm">• Configure seu perfil profissional</p>
                  <p className="text-sm">• Adicione seus serviços</p>
                  <p className="text-sm">• Crie ou entre em uma organização</p>
                </>
              ) : (
                <>
                  <p className="text-sm">• Complete seu perfil</p>
                  <p className="text-sm">• Busque profissionais</p>
                  <p className="text-sm">• Agende seu primeiro serviço</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

