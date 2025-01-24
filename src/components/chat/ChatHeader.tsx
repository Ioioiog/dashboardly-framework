import React from "react";
import { TenantSelect } from "./TenantSelect";
import { useUserRole } from "@/hooks/use-user-role";
import { MessageSquare } from "lucide-react";

interface ChatHeaderProps {
  onTenantSelect: (tenantId: string) => void;
  selectedTenantId: string | null;
}

export function ChatHeader({ onTenantSelect, selectedTenantId }: ChatHeaderProps) {
  const { userRole } = useUserRole();

  return (
    <div className="p-6 border-b bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-semibold">
          {userRole === "landlord" ? "Chat with Tenants" : "Chat with Landlord"}
        </h1>
      </div>
      {userRole === "landlord" && (
        <div className="mt-2">
          <TenantSelect
            onTenantSelect={onTenantSelect}
            selectedTenantId={selectedTenantId || undefined}
          />
        </div>
      )}
    </div>
  );
}