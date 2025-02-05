import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdate: (data: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdate }: MaintenanceCostsTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log("Starting invoice upload for request:", request.id);

      // Upload file to Supabase Storage
      const filePath = `${request.id}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      console.log("Uploading file to path:", filePath);

      const { error: uploadError } = await supabase.storage
        .from('invoice-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded successfully:", filePath);

      // Update maintenance request with document path
      await onUpdate({
        id: request.id,
        document_path: filePath
      });

      toast({
        title: "Invoice uploaded successfully",
        description: "The invoice has been attached to this maintenance request.",
      });
    } catch (error) {
      console.error("Error uploading invoice:", error);
      toast({
        title: "Error uploading invoice",
        description: "There was a problem uploading the invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewInvoice = async () => {
    if (!request.document_path) {
      toast({
        title: "No invoice available",
        description: "There is no invoice uploaded for this maintenance request.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Fetching signed URL for document:", request.document_path);
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('invoice-documents')
        .createSignedUrl(request.document_path, 3600); // 1 hour expiry

      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError);
        throw signedUrlError;
      }

      if (!signedUrlData?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      console.log("Opening document with signed URL:", signedUrlData.signedUrl);
      window.open(signedUrlData.signedUrl, '_blank');
    } catch (error) {
      console.error("Error viewing invoice:", error);
      toast({
        title: "Error viewing invoice",
        description: "There was a problem accessing the invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cost_estimate">Cost Estimate</Label>
        <Input
          id="cost_estimate"
          type="number"
          value={request.cost_estimate || ""}
          onChange={(e) =>
            onUpdate({ cost_estimate: parseFloat(e.target.value) || 0 })
          }
          placeholder="Enter cost estimate..."
        />
      </div>

      <div>
        <Label htmlFor="invoice">Invoice Document</Label>
        {!isUploading && (
          <Input
            id="invoice"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="mt-1"
          />
        )}
          
        {request.document_path && (
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-green-600">Invoice uploaded</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewInvoice}
            >
              View Invoice
            </Button>
          </div>
        )}
        {!request.document_path && (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            No invoice uploaded yet
          </p>
        )}
      </div>
    </div>
  );
}