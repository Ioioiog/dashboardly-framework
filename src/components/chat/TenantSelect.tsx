import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TenantSelect {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface TenantSelectProps {
  onTenantSelect: (tenantId: string) => void;
  selectedTenantId?: string;
}

export function TenantSelect({ onTenantSelect, selectedTenantId }: TenantSelectProps) {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      console.log("Fetching tenants...");
      const { data: tenancies, error } = await supabase
        .from("tenancies")
        .select(`
          tenant_id,
          tenant:profiles!tenancies_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching tenants:", error);
        throw error;
      }

      // Filter out any tenancies where tenant data is missing
      const validTenancies = tenancies.filter(tenancy => tenancy.tenant);

      // Deduplicate tenants by tenant_id
      const uniqueTenants = validTenancies.reduce((acc, current) => {
        if (!acc.find(item => item.tenant.id === current.tenant.id)) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof tenancies);

      console.log("Unique tenants:", uniqueTenants);
      return uniqueTenants;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-10 w-[300px]" />;
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        No active tenants available
      </div>
    );
  }

  return (
    <Select
      value={selectedTenantId}
      onValueChange={(value) => onTenantSelect(value)}
    >
      <SelectTrigger className="w-[300px] bg-white dark:bg-slate-900">
        <SelectValue placeholder="Select a tenant to start chatting" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenancy) => {
          // Additional safety check
          if (!tenancy.tenant) return null;
          
          const fullName = [tenancy.tenant.first_name, tenancy.tenant.last_name]
            .filter(Boolean)
            .join(" ");
          
          return (
            <SelectItem 
              key={tenancy.tenant.id} 
              value={tenancy.tenant.id}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex flex-col">
                <span className="font-medium">{fullName}</span>
                {tenancy.tenant.email && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {tenancy.tenant.email}
                  </span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}