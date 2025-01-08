import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";
import { DocumentType } from "@/integrations/supabase/types/document-types";

interface DocumentListProps {
  userId: string;
  userRole: "landlord" | "tenant";
  propertyFilter: string;
  typeFilter: "all" | DocumentType;
}

export function DocumentList({ userId, userRole, propertyFilter, typeFilter }: DocumentListProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", propertyFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select(`
          *,
          property:properties (
            id,
            name,
            address
          ),
          tenant:profiles (
            first_name,
            last_name,
            email
          )
        `);

      if (propertyFilter && propertyFilter !== "all") {
        query = query.eq("property_id", propertyFilter);
      }

      if (typeFilter && typeFilter !== "all") {
        query = query.eq("document_type", typeFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents?.map((document) => (
        <DocumentCard 
          key={document.id} 
          document={document} 
          userRole={userRole} 
        />
      ))}
    </div>
  );
}