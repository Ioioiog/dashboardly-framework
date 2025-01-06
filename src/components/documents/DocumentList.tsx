import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from "./DocumentCard";
import { DocumentListSkeleton } from "./DocumentListSkeleton";
import { EmptyDocumentState } from "./EmptyDocumentState";

interface DocumentListProps {
  userId: string;
  userRole: "landlord" | "tenant";
}

export function DocumentList({ userId, userRole }: DocumentListProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", userId],
    queryFn: async () => {
      console.log("Fetching documents for user:", userId);
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          property:properties(id, name, address)
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

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (!documents?.length) {
    return <EmptyDocumentState userRole={userRole} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} userRole={userRole} />
      ))}
    </div>
  );
}