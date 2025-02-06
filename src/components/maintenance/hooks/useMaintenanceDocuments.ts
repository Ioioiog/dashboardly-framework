import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMaintenanceDocuments(requestId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["maintenance-documents", requestId],
    enabled: !!requestId && enabled,
    queryFn: async () => {
      console.log("Fetching documents for request:", requestId);
      try {
        const { data: files, error } = await supabase
          .storage
          .from('maintenance-documents')
          .list(requestId || '');

        if (error) {
          console.error("Error fetching documents:", error);
          return [];
        }

        console.log(`Found ${files?.length || 0} documents`);
        return files || [];
      } catch (error) {
        console.error("Unexpected error in documents query:", error);
        return [];
      }
    }
  });
}