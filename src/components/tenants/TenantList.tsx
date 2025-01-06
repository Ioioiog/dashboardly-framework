import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TenantCard } from "./TenantCard";
import { supabase } from "@/integrations/supabase/client";

interface Tenant {
  id: string;
  first_name: string | null;
  last_name: string | null;
  property: {
    name: string;
    address: string;
  };
  tenancy: {
    start_date: string;
    end_date: string | null;
    status: string;
  };
}

async function fetchTenants(userId: string, userRole: "landlord" | "tenant") {
  console.log(`Fetching tenants for ${userRole} with ID:`, userId);
  
  if (userRole === "landlord") {
    const { data, error } = await supabase
      .from("tenancies")
      .select(`
        tenant:profiles!tenancies_tenant_id_fkey(
          id,
          first_name,
          last_name
        ),
        property:properties(
          name,
          address
        ),
        start_date,
        end_date,
        status
      `)
      .eq("properties.landlord_id", userId);

    if (error) {
      console.error("Error fetching tenants:", error);
      throw error;
    }

    console.log("Fetched tenants:", data);
    return data?.map(({ tenant, property, ...tenancy }) => ({
      id: tenant.id,
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      property,
      tenancy,
    }));
  } else {
    const { data, error } = await supabase
      .from("tenancies")
      .select(`
        start_date,
        end_date,
        status,
        property:properties(
          name,
          address
        )
      `)
      .eq("tenant_id", userId)
      .single();

    if (error) {
      console.error("Error fetching tenant details:", error);
      throw error;
    }

    console.log("Fetched tenant details:", data);
    return [data].map(({ property, ...tenancy }) => ({
      id: userId,
      property,
      tenancy,
    }));
  }
}

interface TenantListProps {
  userId: string;
  userRole: "landlord" | "tenant";
}

export function TenantList({ userId, userRole }: TenantListProps) {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants", userId, userRole],
    queryFn: () => fetchTenants(userId, userRole),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!tenants?.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          {userRole === "landlord" 
            ? "No tenants found. Add properties and create tenancies to get started!"
            : "No active tenancies found."}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <TenantCard key={tenant.id} tenant={tenant} userRole={userRole} />
      ))}
    </div>
  );
}