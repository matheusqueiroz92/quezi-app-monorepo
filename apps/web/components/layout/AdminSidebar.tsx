"use client";

import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export function AdminSidebar() {
  const { user, logout } = useAuth();

  if (!user || user.userType !== "ADMIN") {
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

  const adminMenuItems = [
    { icon: Home, label: "Dashboard Geral", href: "/dashboard" },
    { icon: Users, label: "Usuários", href: "/admin/users" },
    { icon: Briefcase, label: "Serviços Cadastrados", href: "/admin/services" },
    { icon: DollarSign, label: "Financeiro", href: "/admin/financial" },
    {
      icon: CreditCard,
      label: "Transações & Pagamentos",
      href: "/admin/transactions",
    },
    {
      icon: Settings,
      label: "Configurações de Sistema",
      href: "/admin/settings",
    },
    { icon: HelpCircle, label: "Suporte/Ajuda", href: "/admin/support" },
  ];

  return (
    <nav className="w-64 bg-white shadow-lg border-r border-neutral-light h-full flex flex-col">
      {/* Logo */}
      <div className="flex justify-center py-6 border-b border-neutral-light">
        <Logo size="md" />
      </div>

      {/* Admin Info */}
      <div className="p-6 border-b border-neutral-light">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marsala to-marsala-dark flex items-center justify-center text-white font-semibold border-2 border-gold">
            {getUserInitials(user.name)}
          </div>
          <div>
            <p className="font-semibold text-neutral-graphite">{user.name}</p>
            <p className="text-xs text-marsala font-medium">Administrador</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {adminMenuItems.map((item) => {
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
