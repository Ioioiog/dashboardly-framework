import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";
import { DocumentListSkeleton } from "./DocumentListSkeleton";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { useToast } from "@/hooks/use-toast";

interface DocumentListProps {
  userId: string;
  propertyFilter: string;
  typeFilter: string;
}

export function DocumentList({ userId, propertyFilter, typeFilter }: DocumentListProps) {
  const { toast } = useToast();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ["documents", userId, propertyFilter, typeFilter],
    queryFn: async () => {
      console.log("Fetching documents with filters:", { userId, propertyFilter, typeFilter });
      
      // First check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Failed to verify user profile");
      }

      // If no profile exists, create one
      if (!profile) {
        console.log("No profile found, creating one...");
        const { error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              role: "tenant", // Default role
            },
          ]);

        if (createError) {
          console.error("Error creating profile:", createError);
          throw new Error("Failed to create user profile");
        }
      }

      let query = supabase
        .from("documents")
        .select(`
          *,
          property:properties (
            name,
            address
          ),
          uploaded_by:profiles!documents_uploaded_by_fkey (
            first_name,
            last_name
          )
        `);

      // Apply filters
      if (propertyFilter !== "all") {
        query = query.eq("property_id", propertyFilter);
      }
      
      if (typeFilter !== "all") {
        query = query.eq("document_type", typeFilter);
      }

      // Apply user-specific filters based on role
      if (profile?.role === "tenant") {
        query = query.or(`tenant_id.eq.${userId},uploaded_by.eq.${userId}`);
      } else {
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
    return <EmptyDocumentState />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
}