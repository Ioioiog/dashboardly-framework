import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { FileObject } from "@supabase/storage-js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { FileUp, Eye, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isDeletingFile, setIsDeletingFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

      const { error: uploadError } = await supabase.storage
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

  const handleViewDocument = async (filePath: string) => {
    try {
      console.log("Getting signed URL for document:", filePath);
      
      // First try to download the file to get a signed URL
      const { data, error } = await supabase.storage
        .from('maintenance-documents')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error('Failed to generate signed URL');
      }

      console.log("Generated signed URL:", data.signedUrl);
      setPreviewUrl(data.signedUrl);
      setShowPreview(true);
    } catch (error) {
      console.error("Error getting document URL:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve document",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = async (filePath: string) => {
    try {
      setIsDeletingFile(filePath);
      const { error } = await supabase.storage
        .from('maintenance-documents')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      // Trigger a refresh of the documents list
      onUpdateRequest({ ...request });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    } finally {
      setIsDeletingFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentUpload}
                disabled={isUploading}
                className="cursor-pointer file:cursor-pointer file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:mr-4 file:rounded-md hover:file:bg-primary/90 transition-colors"
              />
            </div>
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>

          <ScrollArea className="h-[300px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div 
                    key={doc.name}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm font-medium truncate flex-1">
                      {doc.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDocument(doc.name)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDocument(doc.name)}
                        disabled={isDeletingFile === doc.name}
                      >
                        {isDeletingFile === doc.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileUp className="h-8 w-8 mb-2" />
                <p>No documents uploaded yet</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full rounded-md"
              title="Document Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}