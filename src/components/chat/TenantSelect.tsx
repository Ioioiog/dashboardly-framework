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

interface TenantSelectProps {
  onTenantSelect: (tenantId: string) => void;
  selectedTenantId?: string;
}

export function TenantSelect({ onTenantSelect, selectedTenantId }: TenantSelectProps) {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
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

      if (error) throw error;

      // Deduplicate tenants by tenant_id
      const uniqueTenants = tenancies.reduce((acc, current) => {
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

  return (
    <Select
      value={selectedTenantId}
      onValueChange={(value) => onTenantSelect(value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a tenant" />
      </SelectTrigger>
      <SelectContent>
        {tenants?.map((tenancy) => (
          <SelectItem key={tenancy.tenant.id} value={tenancy.tenant.id}>
            {tenancy.tenant.first_name} {tenancy.tenant.last_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}