"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";

export function Header() {
  const { user } = useAuth();

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

  return (
    <header className="bg-white shadow-sm border-b border-neutral-light h-16 flex items-center justify-between px-6">
      {/* Left side - can be used for breadcrumbs or page title */}
      <div className="flex-1">
        {/* Placeholder for future breadcrumbs or page title */}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notificações"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {/* Badge for unread notifications */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm" aria-label="Configurações">
          <Settings className="w-5 h-5" />
        </Button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-marsala to-marsala-dark flex items-center justify-center text-white text-sm font-semibold">
          {getUserInitials(user.name)}
        </div>
      </div>
    </header>
  );
}
