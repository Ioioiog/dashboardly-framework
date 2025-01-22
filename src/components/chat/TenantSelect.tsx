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
    return <div>Loading tenants...</div>;
  }

  if (!tenants || tenants.length === 0) {
    return <div>No tenants available</div>;
  }

  return (
    <Select
      value={selectedTenantId}
      onValueChange={(value) => onTenantSelect(value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a tenant" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenancy) => {
          // Additional safety check
          if (!tenancy.tenant) return null;
          
          return (
            <SelectItem key={tenancy.tenant.id} value={tenancy.tenant.id}>
              {tenancy.tenant.first_name} {tenancy.tenant.last_name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}