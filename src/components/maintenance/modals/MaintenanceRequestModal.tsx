import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Users, DollarSign, MessageSquare, FileText, Upload, Eye, Trash2 } from "lucide-react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { MaintenanceReviewTab } from "../tabs/MaintenanceReviewTab";
import { MaintenanceProviderTab } from "../tabs/MaintenanceProviderTab";
import { MaintenanceCostsTab } from "../tabs/MaintenanceCostsTab";
import { MaintenanceChatTab } from "../tabs/MaintenanceChatTab";
import { MaintenanceDocumentTab } from "../tabs/MaintenanceDocumentTab";
import { useUserRole } from "@/hooks/use-user-role";
import { FileObject } from "@supabase/storage-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
  documents?: FileObject[];
  isLoadingDocuments?: boolean;
}

export default function MaintenanceRequestModal({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
  documents,
  isLoadingDocuments
}: MaintenanceRequestModalProps) {
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const fileExt = file.name.split('.').pop();
      const filePath = `${request.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('maintenance-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Refresh documents list
      onUpdateRequest({ ...request });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Maintenance Request Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="review" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Initial Review
            </TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <MaintenanceReviewTab 
              request={request}
              onUpdateRequest={onUpdateRequest}
            />
          </TabsContent>

          <TabsContent value="provider">
            <MaintenanceProviderTab
              request={request}
              onUpdateRequest={onUpdateRequest}
            />
          </TabsContent>

          <TabsContent value="costs">
            <MaintenanceCostsTab
              request={request}
              onUpdateRequest={onUpdateRequest}
            />
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Maintenance Documents</h3>
                <div className="relative">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="cursor-pointer file:cursor-pointer file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:mr-4 file:rounded-md hover:file:bg-primary/90 transition-colors"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Upload className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <MaintenanceDocumentTab
                request={request}
                onUpdateRequest={onUpdateRequest}
                documents={documents}
                isLoading={isLoadingDocuments}
              />
            </div>
          </TabsContent>

          <TabsContent value="communication">
            <MaintenanceChatTab requestId={request.id || ''} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}