import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";
import { DocumentListSkeleton } from "./DocumentListSkeleton";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { useState } from "react";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentType } from "@/integrations/supabase/types/document-types";

interface DocumentListProps {
  userId: string;
  userRole: "landlord" | "tenant";
}

export function DocumentList({ userId, userRole }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");

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

  // Fetch documents with filters applied at query level
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", userId, propertyFilter, typeFilter],
    queryFn: async () => {
      console.log("Fetching documents with filters:", {
        userId,
        propertyFilter,
        typeFilter
      });

      let query = supabase
        .from("documents")
        .select(`
          *,
          property:properties(id, name, address)
        `);

      // Base filter for user's documents
      if (userRole === "tenant") {
        query = query.eq("tenant_id", userId);
      } else {
        // For landlords, show documents they uploaded or are related to their properties
        const { data: ownedProperties } = await supabase
          .from("properties")
          .select("id")
          .eq("landlord_id", userId);
        
        const propertyIds = ownedProperties?.map(p => p.id) || [];
        
        query = query.or(
          `uploaded_by.eq.${userId},property_id.in.(${propertyIds.join(",")})`
        );
      }

      // Apply property filter
      if (propertyFilter !== "all") {
        query = query.eq("property_id", propertyFilter);
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

  return (
    <div className="space-y-6">
      <DocumentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        propertyFilter={propertyFilter}
        setPropertyFilter={setPropertyFilter}
        properties={properties}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments?.map((document) => (
          <DocumentCard key={document.id} document={document} userRole={userRole} />
        ))}
      </div>
    </div>
  );
}