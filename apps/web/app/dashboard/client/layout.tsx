"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader } from "@/components/common/Loader";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
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

  if (!user || user.userType !== "CLIENT") {
    return null; // Redirecionando para login
  }

  return (
    <div className="flex min-h-screen bg-neutral-pearl">
      {/* Sidebar */}
      <Sidebar />

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
