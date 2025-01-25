import React from "react";
import { TenantSelect } from "./TenantSelect";
import { useUserRole } from "@/hooks/use-user-role";
import { MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onTenantSelect: (tenantId: string) => void;
  selectedTenantId: string | null;
}

export function ChatHeader({ onTenantSelect, selectedTenantId }: ChatHeaderProps) {
  const { userRole } = useUserRole();

  return (
    <div className="p-6 border-b bg-gradient-to-r from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 rounded-t-2xl backdrop-blur-sm">
      <div className={cn(
        "flex items-center gap-3 mb-4",
        "animate-fade-in"
      )}>
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <MessageSquare className="h-6 w-6 text-blue-500 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {userRole === "landlord" ? "Chat with Tenants" : "Chat with Landlord"}
        </h1>
      </div>
      {userRole === "landlord" && (
        <div className={cn(
          "mt-4 flex items-center gap-3",
          "animate-fade-in delay-100"
        )}>
          <Users className="h-5 w-5 text-slate-400" />
          <TenantSelect
            onTenantSelect={onTenantSelect}
            selectedTenantId={selectedTenantId || undefined}
          />
        </div>
      )}
    </div>
  );
}