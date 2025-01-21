import React from "react";
import { TenantSelect } from "./TenantSelect";
import { useUserRole } from "@/hooks/use-user-role";

interface ChatHeaderProps {
  onTenantSelect: (tenantId: string) => void;
  selectedTenantId: string | null;
}

export function ChatHeader({ onTenantSelect, selectedTenantId }: ChatHeaderProps) {
  const { userRole } = useUserRole();

  return (
    <div className="p-4 border-b">
      <h1 className="text-2xl font-semibold">
        {userRole === "landlord" ? "Chat with Tenants" : "Chat with Landlord"}
      </h1>
      {userRole === "landlord" && (
        <div className="mt-4">
          <TenantSelect
            onTenantSelect={onTenantSelect}
            selectedTenantId={selectedTenantId || undefined}
          />
        </div>
      )}
    </div>
  );
}