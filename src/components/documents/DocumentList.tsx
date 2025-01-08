import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";
import { DocumentListSkeleton } from "./DocumentListSkeleton";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { useToast } from "@/hooks/use-toast";
import { DocumentType } from "@/integrations/supabase/types/document-types";

interface DocumentListProps {
  userId: string;
  propertyFilter: string;
  typeFilter: string;
  userRole: "landlord" | "tenant";
}

export function DocumentList({ userId, propertyFilter, typeFilter, userRole }: DocumentListProps) {
  const { toast } = useToast();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ["documents", userId, propertyFilter, typeFilter],
    queryFn: async () => {
      console.log("Fetching documents with filters:", { userId, propertyFilter, typeFilter });
      
      let query = supabase
        .from("documents")
        .select(`
          *,
          property:properties (
            id,
            name,
            address
          )
        `);

      // Apply filters
      if (propertyFilter && propertyFilter !== "all") {
        query = query.eq("property_id", propertyFilter);
      }
      
      if (typeFilter && typeFilter !== "all") {
        query = query.eq("document_type", typeFilter as DocumentType);
      }

      // For tenants, get documents where:
      // 1. They are the tenant_id OR
      // 2. They are the uploader OR
      // 3. The document is linked to a property where they are an active tenant
      if (userRole === "tenant") {
        const { data: tenantProperties } = await supabase
          .from("tenancies")
          .select("property_id")
          .eq("tenant_id", userId)
          .eq("status", "active");

        const propertyIds = tenantProperties?.map(t => t.property_id) || [];
        
        if (propertyIds.length > 0) {
          query = query.or(
            `tenant_id.eq.${userId},uploaded_by.eq.${userId},property_id.in.(${propertyIds.join(',')})`
          );
        } else {
          query = query.or(`tenant_id.eq.${userId},uploaded_by.eq.${userId}`);
        }
      } else {
        // For landlords, only show documents they uploaded
        query = query.eq("uploaded_by", userId);
      }

      const { data, error: documentsError } = await query;

      if (documentsError) {
        console.error("Error fetching documents:", documentsError);
        throw documentsError;
      }

      console.log("Documents fetched:", data);
      return data || [];
    },
  });

  if (error) {
    console.error("Error in DocumentList:", error);
    toast({
      title: "Error",
      description: "Failed to load documents. Please try again.",
      variant: "destructive",
    });
    return null;
  }

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (!documents?.length) {
    return <EmptyDocumentState userRole={userRole} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard 
          key={document.id} 
          document={document} 
          userRole={userRole}
        />
      ))}
    </div>
  );
}