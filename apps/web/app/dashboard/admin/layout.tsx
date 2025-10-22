"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Header } from "@/components/layout/Header";
import { Loader } from "@/components/common/Loader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, getProfile, isLoading } = useAuth();

  useEffect(() => {
    // Carrega perfil do usuário ao montar
    getProfile().catch(() => {
      // Redireciona para login se não autenticado (já tratado no hook)
    });
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!user || user.userType !== "ADMIN") {
    return null; // Redirecionando para login
  }

  return (
    <div className="flex min-h-screen bg-neutral-pearl">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
