"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Users,
  Search,
  _Filter,
  Download,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  _AlertTriangle,
} from "lucide-react";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  // Mock data - em produção viria da API
  const userStats = [
    {
      title: "Total de Usuários",
      value: "2,847",
      icon: Users,
      trend: { value: 12, direction: "up" },
      description: "Usuários cadastrados na plataforma",
      color: "marsala",
    },
    {
      title: "Clientes Ativos",
      value: "1,923",
      icon: Users,
      trend: { value: 8, direction: "up" },
      description: "Clientes ativos este mês",
      color: "gold",
    },
    {
      title: "Profissionais Ativos",
      value: "924",
      icon: Users,
      trend: { value: 15, direction: "up" },
      description: "Profissionais ativos este mês",
      color: "accent-blush",
    },
    {
      title: "Novos Este Mês",
      value: "156",
      icon: UserPlus,
      trend: { value: 22, direction: "up" },
      description: "Novos cadastros este mês",
      color: "neutral-graphite",
    },
  ];

  const mockUsers = [
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@teste.com",
      userType: "CLIENT",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2024-01-20",
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@teste.com",
      userType: "PROFESSIONAL",
      status: "active",
      createdAt: "2024-01-10",
      lastLogin: "2024-01-19",
    },
    {
      id: "3",
      name: "Ana Costa",
      email: "ana@teste.com",
      userType: "CLIENT",
      status: "pending",
      createdAt: "2024-01-18",
      lastLogin: "2024-01-18",
    },
    {
      id: "4",
      name: "Carlos Lima",
      email: "carlos@teste.com",
      userType: "PROFESSIONAL",
      status: "suspended",
      createdAt: "2024-01-05",
      lastLogin: "2024-01-15",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Pendente
          </Badge>
        );
      case "suspended":
        return <Badge variant="destructive">Suspenso</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "CLIENT":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Cliente
          </Badge>
        );
      case "PROFESSIONAL":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-600"
          >
            Profissional
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      userTypeFilter === "all" || user.userType === userTypeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-graphite mb-2">
          Gerenciamento de Usuários
        </h1>
        <p className="text-neutral-graphite opacity-75">
          Gerencie usuários, clientes e profissionais da plataforma
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {userStats.map((stat, index) => (
          <MetricCard key={index} {...stat} />
        ))}
      </div>

      {/* Filtros e Busca */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-graphite opacity-50 w-4 h-4" />
              <Input
                placeholder="Buscar usuários por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={userTypeFilter === "all" ? "default" : "outline"}
              onClick={() => setUserTypeFilter("all")}
              className={
                userTypeFilter === "all"
                  ? "bg-marsala hover:bg-marsala-dark text-white"
                  : ""
              }
            >
              Todos
            </Button>
            <Button
              variant={userTypeFilter === "CLIENT" ? "default" : "outline"}
              onClick={() => setUserTypeFilter("CLIENT")}
              className={
                userTypeFilter === "CLIENT"
                  ? "bg-marsala hover:bg-marsala-dark text-white"
                  : ""
              }
            >
              Clientes
            </Button>
            <Button
              variant={
                userTypeFilter === "PROFESSIONAL" ? "default" : "outline"
              }
              onClick={() => setUserTypeFilter("PROFESSIONAL")}
              className={
                userTypeFilter === "PROFESSIONAL"
                  ? "bg-marsala hover:bg-marsala-dark text-white"
                  : ""
              }
            >
              Profissionais
            </Button>
          </div>
        </div>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-graphite">
          Lista de Usuários
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold-light"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
          <Button className="bg-marsala hover:bg-marsala-dark text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>
      </div>

      {/* Lista de Usuários */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-graphite uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-graphite uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-graphite uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-graphite uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-graphite uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-graphite uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-medium">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-light">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-marsala to-marsala-dark flex items-center justify-center text-white font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-graphite">
                          {user.name}
                        </div>
                        <div className="text-sm text-neutral-graphite opacity-75">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUserTypeBadge(user.userType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-graphite">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-graphite">
                    {new Date(user.lastLogin).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {user.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {user.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
