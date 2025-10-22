"use client";

import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  Home,
  User,
  Heart,
  Calendar,
  MapPin,
  CreditCard,
  Bell,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  Briefcase,
  Users,
  DollarSign,
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Itens do menu baseados no tipo de usuário (conforme frontend.mdc)
  const getMenuItems = () => {
    if (user.userType === "CLIENT") {
      return [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
        { icon: User, label: "Informações Pessoais", href: "/profile" },
        { icon: MapPin, label: "Endereços Salvos", href: "/addresses" },
        { icon: CreditCard, label: "Métodos de Pagamento", href: "/payments" },
        {
          icon: Calendar,
          label: "Histórico de Agendamentos",
          href: "/appointments",
        },
        { icon: Heart, label: "Serviços Favoritos", href: "/favorites" },
        {
          icon: Bell,
          label: "Notificações e Preferências",
          href: "/notifications",
        },
        { icon: Star, label: "Avaliações Feitas", href: "/reviews" },
        { icon: HelpCircle, label: "Ajuda e Suporte", href: "/help" },
        { icon: Settings, label: "Configurações", href: "/settings" },
      ];
    } else if (user.userType === "PROFESSIONAL") {
      return [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
        { icon: User, label: "Perfil Profissional", href: "/profile" },
        { icon: Calendar, label: "Agendamentos", href: "/appointments" },
        { icon: Bell, label: "Solicitações", href: "/requests" },
        { icon: Briefcase, label: "Serviços Oferecidos", href: "/services" },
        { icon: Users, label: "Clientes Atendidos", href: "/clients" },
        { icon: DollarSign, label: "Financeiro", href: "/financial" },
        {
          icon: Bell,
          label: "Notificações e Preferências",
          href: "/notifications",
        },
        { icon: Star, label: "Avaliações Recebidas", href: "/reviews" },
        { icon: HelpCircle, label: "Ajuda e Suporte", href: "/help" },
        { icon: Settings, label: "Configurações", href: "/settings" },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <nav className="w-64 bg-white shadow-lg border-r border-neutral-light h-full flex flex-col">
      {/* Logo */}
      <div className="flex justify-center py-6 border-b border-neutral-light">
        <Logo size="md" />
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-neutral-light">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marsala to-marsala-dark flex items-center justify-center text-white font-semibold border-2 border-gold">
            {getUserInitials(user.name)}
          </div>
          <div>
            <p className="font-semibold text-neutral-graphite">{user.name}</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-marsala hover:text-marsala-dark p-0 h-auto"
            >
              configurar usuário
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-neutral-graphite hover:text-marsala hover:bg-accent-blush"
                  onClick={() => {
                    // TODO: Implementar navegação
                    console.log(`Navigate to ${item.href}`);
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-neutral-light">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sair
        </Button>
      </div>
    </nav>
  );
}
