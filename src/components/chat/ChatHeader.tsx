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
    <div className="p-4 border-b bg-white dark:bg-slate-900 rounded-t-xl backdrop-blur-sm">
      <div className={cn(
        "flex items-center gap-3 mb-2",
        "animate-fade-in"
      )}>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {userRole === "landlord" ? "Chat with Tenants" : "Chat with Landlord"}
        </h1>
      </div>
      {userRole === "landlord" && (
        <div className={cn(
          "mt-3 flex items-center gap-2",
          "animate-fade-in delay-100"
        )}>
          <Users className="h-4 w-4 text-slate-400" />
          <TenantSelect
            onTenantSelect={onTenantSelect}
            selectedTenantId={selectedTenantId || undefined}
          />
        </div>
      )}
    </div>
  );
}