"use client";

import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  _DollarSign,
  _Calendar,
  Briefcase,
  _TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  UserPlus,
} from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data - em produção viria da API
  const kpis = [
    {
      title: "Total de Usuários",
      value: "2,847",
      icon: "Users",
      trend: { value: 12, direction: "up" as const },
      description: "Usuários cadastrados na plataforma",
      color: "marsala" as const,
    },
    {
      title: "Receita Mensal",
      value: "R$ 45.678",
      icon: "DollarSign",
      trend: { value: 8, direction: "up" as const },
      description: "Faturamento do mês atual",
      color: "gold" as const,
    },
    {
      title: "Agendamentos Hoje",
      value: "156",
      icon: "Calendar",
      trend: { value: 5, direction: "up" as const },
      description: "Agendamentos para hoje",
      color: "accent" as const,
    },
    {
      title: "Serviços Ativos",
      value: "342",
      icon: "Briefcase",
      trend: { value: 3, direction: "up" as const },
      description: "Serviços cadastrados e ativos",
      color: "neutral" as const,
    },
  ];

  const _usersEvolutionData = [
    { name: "Jan", value: 1200 },
    { name: "Fev", value: 1350 },
    { name: "Mar", value: 1500 },
    { name: "Abr", value: 1680 },
    { name: "Mai", value: 1890 },
    { name: "Jun", value: 2100 },
    { name: "Jul", value: 2350 },
    { name: "Ago", value: 2580 },
    { name: "Set", value: 2847 },
  ];

  const _revenueData = [
    { name: "Jan", value: 25000 },
    { name: "Fev", value: 28000 },
    { name: "Mar", value: 32000 },
    { name: "Abr", value: 35000 },
    { name: "Mai", value: 38000 },
    { name: "Jun", value: 42000 },
    { name: "Jul", value: 45000 },
    { name: "Ago", value: 47000 },
    { name: "Set", value: 45678 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "Novo usuário Maria Silva se cadastrou",
      timestamp: "2 minutos atrás",
      icon: UserPlus,
    },
    {
      id: 2,
      type: "service_created",
      message: "Profissional João criou novo serviço 'Manicure Premium'",
      timestamp: "15 minutos atrás",
      icon: Briefcase,
    },
    {
      id: 3,
      type: "appointment_completed",
      message: "Agendamento concluído - Ana + Cabeleireiro Sara",
      timestamp: "1 hora atrás",
      icon: CheckCircle,
    },
  ];

  const pendingReports = [
    {
      id: 1,
      type: "service_quality",
      message: "Denúncia sobre qualidade do serviço",
      user: "Cliente Anônimo",
      timestamp: "1 hora atrás",
    },
    {
      id: 2,
      type: "professional_behavior",
      message: "Comportamento inadequado do profissional",
      user: "Maria Santos",
      timestamp: "3 horas atrás",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "professional_verification",
      message: "Verificação de documentos pendente",
      professional: "Carlos Mendes",
      timestamp: "2 horas atrás",
    },
    {
      id: 2,
      type: "service_approval",
      message: "Aprovação de novo serviço",
      professional: "Ana Costa",
      service: "Massagem Relaxante",
      timestamp: "4 horas atrás",
    },
  ];

  return (
    <main className="flex-1 p-6 bg-neutral-pearl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-graphite mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-neutral-graphite opacity-75">
            Visão geral da plataforma Quezi
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="mb-8">
          <StatsGrid stats={kpis} />
        </div>

        {/* Charts Section - Temporariamente removido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-graphite mb-2">
              Evolução de Usuários
            </h3>
            <p className="text-sm text-neutral-graphite opacity-75 mb-4">
              Crescimento mensal de usuários cadastrados
            </p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-marsala">2,847</p>
                <p className="text-sm text-neutral-graphite">Total</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">+12%</p>
                <p className="text-sm text-neutral-graphite">vs mês anterior</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-graphite mb-2">
              Receita por Mês
            </h3>
            <p className="text-sm text-neutral-graphite opacity-75 mb-4">
              Evolução do faturamento mensal
            </p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-gold">R$ 45.678</p>
                <p className="text-sm text-neutral-graphite">Total</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">+8%</p>
                <p className="text-sm text-neutral-graphite">vs mês anterior</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atividades Recentes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-graphite">
                Atividades Recentes
              </h3>
              <Badge variant="secondary" className="bg-marsala text-white">
                {recentActivities.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-neutral-pearl">
                      <Icon className="w-4 h-4 text-marsala" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-graphite">
                        {activity.message}
                      </p>
                      <p className="text-xs text-neutral-graphite opacity-60">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Denúncias Pendentes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-graphite">
                Denúncias Pendentes
              </h3>
              <Badge variant="destructive" className="bg-red-500">
                {pendingReports.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {pendingReports.map((report) => (
                <div key={report.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-graphite">
                      {report.message}
                    </p>
                    <p className="text-xs text-neutral-graphite opacity-60">
                      {report.user} • {report.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Aprovações Pendentes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-graphite">
                Aprovações Pendentes
              </h3>
              <Badge
                variant="outline"
                className="border-yellow-500 text-yellow-600"
              >
                {pendingApprovals.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-graphite">
                      {approval.message}
                    </p>
                    <p className="text-xs text-neutral-graphite opacity-60">
                      {approval.professional} • {approval.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-graphite mb-4">
              Ações Rápidas
            </h3>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-marsala hover:bg-marsala-dark text-white">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Usuários
              </Button>

              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-white"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Verificar Serviços
              </Button>

              <Button
                variant="outline"
                className="border-marsala text-marsala hover:bg-marsala hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
