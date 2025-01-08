import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";
import { DocumentListSkeleton } from "./DocumentListSkeleton";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTenants } from "@/hooks/useTenants";

type DocumentType = "lease_agreement" | "invoice" | "receipt" | "other";

interface DocumentListProps {
  userId: string;
  userRole: "landlord" | "tenant";
}

export function DocumentList({ userId, userRole }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [tenantFilter, setTenantFilter] = useState<string>("all");

  // Fetch properties for the filter
  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      console.log("Fetching properties...");
      const { data, error } = await supabase
        .from("properties")
        .select("*");

      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      console.log("Properties fetched:", data);
      return data;
    },
  });

  // Use the useTenants hook for tenant data
  const { data: tenants } = useTenants();

  // Fetch documents with filters applied at query level
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", userId, propertyFilter, tenantFilter, typeFilter],
    queryFn: async () => {
      console.log("Fetching documents with filters:", {
        userId,
        propertyFilter,
        tenantFilter,
        typeFilter
      });

      // First, if we're a landlord, get the list of properties we own
      let landlordPropertiesQuery;
      if (userRole === "landlord") {
        const { data: ownedProperties } = await supabase
          .from("properties")
          .select("id")
          .eq("landlord_id", userId);
        
        landlordPropertiesQuery = ownedProperties?.map(p => p.id) || [];
      }

      let query = supabase
        .from("documents")
        .select(`
          *,
          property:properties(id, name, address),
          tenant:profiles(id, first_name, last_name)
        `);

      // Base filter for user's documents
      if (userRole === "tenant") {
        query = query.eq("tenant_id", userId);
      } else {
        // For landlords, show documents they uploaded or are related to their properties
        query = query.or(
          `uploaded_by.eq.${userId},property_id.in.(${landlordPropertiesQuery?.join(",")})`
        );
      }

      // Apply property filter
      if (propertyFilter !== "all") {
        query = query.eq("property_id", propertyFilter);
      }

      // Apply tenant filter for landlords
      if (userRole === "landlord" && tenantFilter !== "all") {
        query = query.eq("tenant_id", tenantFilter);
      }

      // Apply document type filter
      if (typeFilter !== "all") {
        query = query.eq("document_type", typeFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      console.log("Documents fetched:", data);
      return data;
    },
  });

  // Apply search filter on the client side
  const filteredDocuments = documents?.filter((doc) => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (!documents?.length) {
    return <EmptyDocumentState userRole={userRole} />;
  }

  const handleTypeFilterChange = (value: string) => {
    if (value === "all" || ["lease_agreement", "invoice", "receipt", "other"].includes(value)) {
      setTypeFilter(value as "all" | DocumentType);
    }
  };

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
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
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