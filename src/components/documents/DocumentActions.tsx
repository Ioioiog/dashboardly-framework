import { Button } from "@/components/ui/button";
import { Download, Trash2, UserPlus, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AssignTenantDialog } from "./AssignTenantDialog";

interface DocumentActionsProps {
  document: {
    id: string;
    file_path: string;
    tenant_id?: string | null;
    property: {
      id: string;
      name: string;
      address: string;
    } | null;
  };
  userRole: "landlord" | "tenant";
  onDocumentUpdated: () => void;
}

export function DocumentActions({ document: doc, userRole, onDocumentUpdated }: DocumentActionsProps) {
  const { toast } = useToast();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const handleDownload = async () => {
    try {
      // Extract just the filename without any path or UUIDs
      const fileName = doc.file_path.split('/').pop();
      console.log("Attempting to download file:", fileName);
      
      const { data, error } = await supabase.storage
        .from("documents")
        .download(doc.file_path);

      if (error) {
        console.error("Storage download error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data received from storage");
      }

      // Create and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || 'document';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("File download completed successfully");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Could not download the document. Please try again later.",
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
      onDocumentUpdated();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Could not delete the document",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTenant = async () => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ tenant_id: null })
        .eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant access removed successfully",
      });
      onDocumentUpdated();
    } catch (error) {
      console.error("Error removing tenant access:", error);
      toast({
        title: "Error",
        description: "Could not remove tenant access",
        variant: "destructive",
      });
    }
  };

  return (
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
          {doc.tenant_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveTenant}
            >
              <UserX className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}

      <AssignTenantDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        documentId={doc.id}
        propertyId={doc.property?.id || null}
        onAssigned={onDocumentUpdated}
      />
    </div>
  );
}