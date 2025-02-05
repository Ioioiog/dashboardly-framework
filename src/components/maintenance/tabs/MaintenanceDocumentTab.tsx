import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUp, Eye } from "lucide-react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { FileObject } from "@supabase/storage-js";

interface MaintenanceDocumentTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
  documents?: FileObject[];
  isLoading?: boolean;
}

export function MaintenanceDocumentTab({ 
  request, 
  onUpdateRequest,
  documents,
  isLoading 
}: MaintenanceDocumentTabProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting document upload for request:", request.id);
      const fileExt = file.name.split('.').pop();
      const filePath = `${request.id}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('maintenance-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      console.log("File uploaded successfully:", filePath);

      onUpdateRequest({ 
        document_path: filePath
      });

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = () => {
    if (!request.document_path) return;
    
    try {
      console.log("Getting public URL for document:", request.document_path);
      const { data: { publicUrl } } = supabase.storage
        .from('maintenance-documents')
        .getPublicUrl(request.document_path);

      console.log("Generated public URL:", publicUrl);
      window.open(publicUrl, '_blank');
    } catch (error) {
      console.error("Error getting document URL:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleDocumentUpload}
          disabled={isUploading}
          className="cursor-pointer"
        />
        {request.document_path ? (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-600">Document uploaded</p>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleViewDocument}
            >
              <Eye className="h-4 w-4" />
              View Document
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            No document uploaded yet
          </p>
        )}
      </div>
    </div>
  );
}