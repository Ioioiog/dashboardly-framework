import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUp, DollarSign, FileText, Clock } from "lucide-react";
import { useState } from "react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { Card } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdate: (data: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdate }: MaintenanceCostsTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { formatAmount } = useCurrency();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log("Starting invoice upload for request:", request.id);

      const filePath = `maintenance-invoices/${request.id}/${crypto.randomUUID()}-${file.name}`;
      console.log("Uploading file to path:", filePath);

      const { error: uploadError } = await supabase.storage
        .from('invoice-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully. Updating request with document path");

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

      console.log("Opening document with signed URL");
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cost Estimates</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="cost_estimate">Initial Cost Estimate</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="cost_estimate"
                type="number"
                value={request.cost_estimate || ""}
                onChange={(e) =>
                  onUpdate({ cost_estimate: parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter cost estimate..."
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">
                {request.cost_estimate ? formatAmount(request.cost_estimate) : ''}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="service_provider_fee">Service Provider Fee</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="service_provider_fee"
                type="number"
                value={request.service_provider_fee || ""}
                onChange={(e) =>
                  onUpdate({ service_provider_fee: parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter service fee..."
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">
                {request.service_provider_fee ? formatAmount(request.service_provider_fee) : ''}
              </span>
            </div>
          </div>

          {(request.cost_estimate || request.service_provider_fee) && (
            <div className="pt-2">
              <Label>Total Estimated Cost</Label>
              <p className="text-lg font-semibold text-primary">
                {formatAmount((request.cost_estimate || 0) + (request.service_provider_fee || 0))}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Invoice Documents</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="invoice">Upload Invoice</Label>
            {!isUploading && (
              <Input
                id="invoice"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
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
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                <FileUp className="h-4 w-4" />
                No invoice uploaded yet
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Payment Timeline</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className="font-medium capitalize">{request.payment_status || 'Pending'}</span>
          </div>
          
          {request.payment_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Amount:</span>
              <span className="font-medium">{formatAmount(request.payment_amount)}</span>
            </div>
          )}

          {request.completion_date && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion Date:</span>
              <span className="font-medium">
                {new Date(request.completion_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
