import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";
import { DocumentListSkeleton } from "./DocumentListSkeleton";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DocumentListProps {
  userId: string;
  userRole: "landlord" | "tenant";
}

export function DocumentList({ userId, userRole }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [tenantFilter, setTenantFilter] = useState<string>("all");

  // Fetch properties for the filter
  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*");

      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      return data;
    },
  });

  // Fetch tenants for the filter (only for landlords)
  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    enabled: userRole === "landlord",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "tenant");

      if (error) {
        console.error("Error fetching tenants:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", userId],
    queryFn: async () => {
      console.log("Fetching documents for user:", userId);
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          property:properties(id, name, address),
          tenant:profiles(id, first_name, last_name)
        `)
        .or(`tenant_id.eq.${userId},uploaded_by.eq.${userId}`);

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      console.log("Fetched documents:", data);
      return data;
    },
  });

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    const matchesProperty = propertyFilter === "all" || doc.property_id === propertyFilter;
    const matchesTenant = tenantFilter === "all" || doc.tenant_id === tenantFilter;
    return matchesSearch && matchesType && matchesProperty && matchesTenant;
  });

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (!documents?.length) {
    return <EmptyDocumentState userRole={userRole} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="type">Document Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="property">Property</Label>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All properties</SelectItem>
              {properties?.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {userRole === "landlord" && (
          <div>
            <Label htmlFor="tenant">Tenant</Label>
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tenants</SelectItem>
                {tenants?.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments?.map((document) => (
          <DocumentCard key={document.id} document={document} userRole={userRole} />
        ))}
      </div>
    </div>
  );
}