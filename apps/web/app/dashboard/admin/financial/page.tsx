"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  DollarSign,
  Search,
  _Filter,
  Download,
  FileText,
  TrendingUp,
  _TrendingDown,
  Calendar,
  CreditCard,
  Users,
  Percent,
} from "lucide-react";

export default function AdminFinancialPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("today");

  // Mock data - em produção viria da API
  const financialStats = [
    {
      title: "Receita Total",
      value: "R$ 125.847",
      icon: DollarSign,
      trend: { value: 18, direction: "up" },
      description: "Receita total da plataforma",
      color: "marsala",
    },
    {
      title: "Taxa da Plataforma",
      value: "R$ 12.585",
      icon: Percent,
      trend: { value: 15, direction: "up" },
      description: "Comissão da plataforma (10%)",
      color: "gold",
    },
    {
      title: "Transações Processadas",
      value: "2,847",
      icon: CreditCard,
      trend: { value: 12, direction: "up" },
      description: "Total de transações",
      color: "accent-blush",
    },
    {
      title: "Ticket Médio",
      value: "R$ 44,20",
      icon: TrendingUp,
      trend: { value: 8, direction: "up" },
      description: "Valor médio por transação",
      color: "neutral-graphite",
    },
  ];

  const transactions = [
    {
      id: 1,
      client: "Maria Silva",
      professional: "Ana Paula",
      service: "Manicure Completa",
      amount: "R$ 45,00",
      platformFee: "R$ 4,50",
      status: "completed",
      date: "2024-01-22",
      paymentMethod: "Cartão de Crédito",
    },
    {
      id: 2,
      client: "João Santos",
      professional: "Carla Lima",
      service: "Corte de Cabelo",
      amount: "R$ 80,00",
      platformFee: "R$ 8,00",
      status: "pending",
      date: "2024-01-22",
      paymentMethod: "PIX",
    },
    {
      id: 3,
      client: "Fernanda Costa",
      professional: "Roberto Silva",
      service: "Massagem Relaxante",
      amount: "R$ 150,00",
      platformFee: "R$ 15,00",
      status: "completed",
      date: "2024-01-21",
      paymentMethod: "Cartão de Débito",
    },
    {
      id: 4,
      client: "Pedro Oliveira",
      professional: "Mariana Santos",
      service: "Maquiagem para Evento",
      amount: "R$ 120,00",
      platformFee: "R$ 12,00",
      status: "refunded",
      date: "2024-01-21",
      paymentMethod: "Cartão de Crédito",
    },
  ];

  const periods = [
    { label: "Hoje", value: "today" },
    { label: "Esta Semana", value: "week" },
    { label: "Este Mês", value: "month" },
    { label: "Este Ano", value: "year" },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.professional
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        );
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">Reembolsada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-graphite mb-2">
          Financeiro da Plataforma
        </h1>
        <p className="text-neutral-graphite opacity-75">
          Gerencie receitas, comissões e transações da plataforma
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {financialStats.map((stat) => (
          <MetricCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            description={stat.description}
            color={stat.color}
          />
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-graphite opacity-50 w-4 h-4" />
              <Input
                placeholder="Buscar transações por cliente, profissional ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={periodFilter === period.value ? "default" : "outline"}
                className={
                  periodFilter === period.value
                    ? "bg-marsala hover:bg-marsala-dark text-white"
                    : ""
                }
                onClick={() => setPeriodFilter(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-graphite">
          Lista de Transações
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold-light"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button className="bg-marsala hover:bg-marsala-dark text-white">
            <FileText className="w-4 h-4 mr-2" />
            Gerar Fatura
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-light">
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Profissional
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Serviço
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Valor
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Taxa Plataforma
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Data
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Pagamento
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-neutral-light hover:bg-accent-blush"
                >
                  <td className="py-3 px-4 text-neutral-graphite">
                    {transaction.client}
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite">
                    {transaction.professional}
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite">
                    {transaction.service}
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite font-medium">
                    {transaction.amount}
                  </td>
                  <td className="py-3 px-4 text-marsala font-medium">
                    {transaction.platformFee}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-neutral-medium" />
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-neutral-medium" />
                      {transaction.paymentMethod}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-neutral-medium mx-auto mb-4" />
            <p className="text-neutral-graphite">
              Nenhuma transação encontrada com os filtros aplicados.
            </p>
          </div>
        )}
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-graphite mb-4">
            Resumo do Período
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-graphite">Receita Total:</span>
              <span className="font-semibold text-marsala">R$ 125.847</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-graphite">Taxa da Plataforma:</span>
              <span className="font-semibold text-gold">R$ 12.585</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-graphite">Transações:</span>
              <span className="font-semibold text-neutral-graphite">2,847</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-graphite">Ticket Médio:</span>
              <span className="font-semibold text-neutral-graphite">
                R$ 44,20
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-graphite mb-4">
            Tendências
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-neutral-graphite">Crescimento mensal:</span>
              <span className="font-semibold text-green-600">+18%</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-neutral-graphite">Novos usuários:</span>
              <span className="font-semibold text-blue-600">+12%</span>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gold" />
              <span className="text-neutral-graphite">Receita média:</span>
              <span className="font-semibold text-gold">+8%</span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
