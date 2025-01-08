import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";

export function DocumentList() {
  const selectedPropertyId = ""; // Replace with actual state or prop
  const selectedDocumentType = ""; // Replace with actual state or prop

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", selectedPropertyId, selectedDocumentType],
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

      if (selectedPropertyId) {
        query = query.eq("property_id", selectedPropertyId);
      }

      if (selectedDocumentType && selectedDocumentType !== "all") {
        query = query.eq("document_type", selectedDocumentType);
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
    <div>
      {documents?.map((document) => (
        <DocumentCard key={document.id} document={document} userRole="landlord" />
      ))}
    </div>
  );
}
