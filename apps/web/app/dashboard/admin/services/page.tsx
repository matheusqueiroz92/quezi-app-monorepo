"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Briefcase,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
} from "lucide-react";

export default function AdminServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data - em produção viria da API
  const serviceStats = [
    {
      title: "Total de Serviços",
      value: "1,247",
      icon: "Briefcase",
      trend: { value: 15, direction: "up" },
      description: "Serviços cadastrados na plataforma",
      color: "marsala",
    },
    {
      title: "Serviços Ativos",
      value: "1,156",
      icon: "Star",
      trend: { value: 8, direction: "up" },
      description: "Serviços ativos e disponíveis",
      color: "gold",
    },
    {
      title: "Novos Este Mês",
      value: "89",
      icon: "Plus",
      trend: { value: 12, direction: "up" },
      description: "Novos serviços cadastrados",
      color: "accent-blush",
    },
    {
      title: "Categorias Disponíveis",
      value: "12",
      icon: "Tag",
      trend: { value: 3, direction: "up" },
      description: "Categorias de serviços ativas",
      color: "neutral-graphite",
    },
  ];

  const services = [
    {
      id: 1,
      name: "Corte de Cabelo Feminino",
      category: "Cabelo",
      price: "R$ 80,00",
      duration: "60 min",
      professional: "Maria Silva",
      rating: 4.8,
      reviews: 156,
      status: "ativo",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Manicure Completa",
      category: "Unhas",
      price: "R$ 45,00",
      duration: "90 min",
      professional: "Ana Paula",
      rating: 4.9,
      reviews: 203,
      status: "ativo",
      createdAt: "2024-01-10",
    },
    {
      id: 3,
      name: "Maquiagem para Eventos",
      category: "Makeup",
      price: "R$ 120,00",
      duration: "120 min",
      professional: "Carla Santos",
      rating: 4.7,
      reviews: 89,
      status: "inativo",
      createdAt: "2024-01-05",
    },
    {
      id: 4,
      name: "Massagem Relaxante",
      category: "Estética",
      price: "R$ 150,00",
      duration: "90 min",
      professional: "João Silva",
      rating: 4.6,
      reviews: 67,
      status: "ativo",
      createdAt: "2024-01-20",
    },
  ];

  const categories = [
    "Todas as Categorias",
    "Cabelo",
    "Unhas",
    "Makeup",
    "Estética",
    "Massagem",
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.professional.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      service.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-graphite mb-2">
          Gerenciamento de Serviços
        </h1>
        <p className="text-neutral-graphite opacity-75">
          Gerencie todos os serviços oferecidos na plataforma
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {serviceStats.map((stat) => (
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
                placeholder="Buscar serviços por nome ou profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  categoryFilter ===
                  category.toLowerCase().replace("todas as categorias", "all")
                    ? "default"
                    : "outline"
                }
                className={
                  categoryFilter ===
                  category.toLowerCase().replace("todas as categorias", "all")
                    ? "bg-marsala hover:bg-marsala-dark text-white"
                    : ""
                }
                onClick={() =>
                  setCategoryFilter(
                    category.toLowerCase().replace("todas as categorias", "all")
                  )
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Services List */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-graphite">
          Lista de Serviços
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
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-light">
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Serviço
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Categoria
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Preço
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Duração
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Profissional
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Avaliação
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-graphite">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-neutral-light hover:bg-accent-blush"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-neutral-graphite">
                        {service.name}
                      </p>
                      <p className="text-sm text-neutral-medium">
                        Criado em{" "}
                        {new Date(service.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className="border-marsala text-marsala"
                    >
                      {service.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite font-medium">
                    {service.price}
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-neutral-medium" />
                      {service.duration}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-graphite">
                    {service.professional}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold fill-current" />
                      <span className="text-neutral-graphite">
                        {service.rating}
                      </span>
                      <span className="text-sm text-neutral-medium">
                        ({service.reviews})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        service.status === "ativo" ? "default" : "secondary"
                      }
                      className={
                        service.status === "ativo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {service.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-marsala hover:text-marsala-dark hover:bg-accent-blush"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gold hover:text-gold-medium hover:bg-gold-light"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-neutral-medium mx-auto mb-4" />
            <p className="text-neutral-graphite">
              Nenhum serviço encontrado com os filtros aplicados.
            </p>
          </div>
        )}
      </Card>
    </main>
  );
}
