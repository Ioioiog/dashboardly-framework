import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdateRequest }: MaintenanceCostsTabProps) {
  const { toast } = useToast();
  const { userRole } = useUserRole();
  const isServiceProvider = userRole === 'service_provider';

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      console.log("Starting invoice upload for request:", request.id);
      const fileExt = file.name.split('.').pop();
      const filePath = `${request.id}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('invoice-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      console.log("File uploaded successfully:", filePath);

      onUpdateRequest({ 
        invoice_document_path: filePath,
        payment_status: 'invoiced'
      });

      toast({
        title: "Success",
        description: "Invoice uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading invoice:', error);
      toast({
        title: "Error",
        description: "Failed to upload invoice",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoice = async () => {
    if (!request.invoice_document_path) {
      console.log("No invoice document path available");
      return;
    }
    
    try {
      console.log("Getting signed URL for invoice path:", request.invoice_document_path);
      
      const { data, error } = await supabase.storage
        .from('invoice-documents')
        .createSignedUrl(request.invoice_document_path, 300);

      if (error) {
        console.error("Error getting signed URL:", error);
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error("No signed URL received");
      }

      console.log("Opening signed URL:", data.signedUrl);
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Error viewing invoice:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve invoice",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Service Provider Fee</Label>
        <Input
          type="number"
          value={request.service_provider_fee || 0}
          onChange={(e) => onUpdateRequest({ service_provider_fee: parseFloat(e.target.value) })}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Final Cost</Label>
        <Input
          type="number"
          value={request.payment_amount || 0}
          onChange={(e) => onUpdateRequest({ payment_amount: parseFloat(e.target.value) })}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <Card className="p-4">
        <div className="space-y-2">
          <Label>Invoice Document</Label>
          {isServiceProvider && (
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleInvoiceUpload}
              className="cursor-pointer"
            />
          )}
          
          {request.invoice_document_path ? (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-green-600">Invoice uploaded</p>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleViewInvoice}
              >
                <Eye className="h-4 w-4" />
                View Invoice
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              No invoice uploaded yet
            </p>
          )}
        </div>
      </Card>

      <div className="space-y-2">
        <Label>Invoice Notes</Label>
        <Textarea
          value={request.cost_estimate_notes || ''}
          onChange={(e) => onUpdateRequest({ cost_estimate_notes: e.target.value })}
          className="bg-white min-h-[100px]"
          placeholder="Add any notes about costs or invoice details here..."
          disabled={!isServiceProvider}
        />
      </div>
    </div>
  );
}