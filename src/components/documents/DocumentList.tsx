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
  const [typeFilter, setTypeFilter] = useState<string>("");

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

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (!documents?.length) {
    return <EmptyDocumentState userRole={userRole} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments?.map((document) => (
          <DocumentCard key={document.id} document={document} userRole={userRole} />
        ))}
      </div>
    </div>
  );
}