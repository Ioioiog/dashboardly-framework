import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    file_path: string;
    created_at: string;
    document_type: "lease_agreement" | "invoice" | "receipt" | "other";
    property: {
      name: string;
      address: string;
    } | null;
    tenant_id?: string | null;
  };
  userRole: "landlord" | "tenant";
}

const documentTypeLabels = {
  lease_agreement: "Lease Agreement",
  invoice: "Invoice",
  receipt: "Receipt",
  other: "Other",
};

export function DocumentCard({ document: doc, userRole }: DocumentCardProps) {
  const { toast } = useToast();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Fetch tenants for the property if it exists
  const { data: tenants } = useQuery({
    queryKey: ["property-tenants", doc.property?.name],
    queryFn: async () => {
      if (!doc.property) return [];
      
      const { data, error } = await supabase
        .from("tenancies")
        .select(`
          tenant_id,
          tenant:profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("property_id", doc.property.id)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!doc.property && userRole === "landlord",
  });

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Could not download the document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Could not delete the document",
        variant: "destructive",
      });
    }
  };

  const handleAssignTenant = async (tenantId: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ tenant_id: tenantId })
        .eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document assigned successfully",
      });
      setIsAssignDialogOpen(false);
    } catch (error) {
      console.error("Error assigning document:", error);
      toast({
        title: "Error",
        description: "Could not assign the document",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="truncate">{doc.name}</span>
            </CardTitle>
            <Badge variant="secondary">
              {documentTypeLabels[doc.document_type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doc.property && (
              <div>
                <p className="text-sm font-medium text-gray-500">Property</p>
                <p className="text-sm">{doc.property.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Uploaded</p>
              <p className="text-sm">
                {format(new Date(doc.created_at), "PPP")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {userRole === "landlord" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAssignDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Document to Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select onValueChange={handleAssignTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants?.map((tenant) => (
                  <SelectItem key={tenant.tenant_id} value={tenant.tenant_id}>
                    {tenant.tenant.first_name} {tenant.tenant.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}