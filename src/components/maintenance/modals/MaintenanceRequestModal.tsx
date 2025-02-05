import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Users, DollarSign, MessageSquare, FileText } from "lucide-react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { MaintenanceReviewTab } from "../tabs/MaintenanceReviewTab";
import { MaintenanceProviderTab } from "../tabs/MaintenanceProviderTab";
import { MaintenanceCostsTab } from "../tabs/MaintenanceCostsTab";
import { MaintenanceChatTab } from "../tabs/MaintenanceChatTab";
import { MaintenanceDocumentTab } from "../tabs/MaintenanceDocumentTab";
import { useUserRole } from "@/hooks/use-user-role";
import { FileObject } from "@supabase/storage-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
  documents?: FileObject[];
  isLoadingDocuments?: boolean;
}

export const MaintenanceRequestModal = ({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: MaintenanceRequestModalProps) => {
  const { userRole } = useUserRole();

  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['maintenance-documents', request.id],
    enabled: !!request.id,
    queryFn: async () => {
      console.log("Fetching documents for request:", request.id);
      
      // First, get the list of files from the maintenance-documents bucket
      const { data: maintenanceFiles, error: maintenanceError } = await supabase.storage
        .from('maintenance-documents')
        .list(`${request.id}`);

      if (maintenanceError) {
        console.error("Error fetching maintenance documents:", maintenanceError);
        throw maintenanceError;
      }

      // Then, get the invoice document if it exists
      let invoiceFiles: FileObject[] = [];
      if (request.invoice_document_path) {
        console.log("Fetching invoice document:", request.invoice_document_path);
        const { data: invoiceData, error: invoiceError } = await supabase.storage
          .from('invoice-documents')
          .list(`${request.id}`);

        if (invoiceError) {
          console.error("Error fetching invoice document:", invoiceError);
        } else if (invoiceData) {
          invoiceFiles = invoiceData;
        }
      }

      const allFiles = [...(maintenanceFiles || []), ...(invoiceFiles || [])];
      console.log("All fetched documents:", allFiles);
      return allFiles;
    }
  });

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
            <MaintenanceDocumentTab
              request={request}
              onUpdateRequest={onUpdateRequest}
              documents={documents}
              isLoading={isLoadingDocuments}
            />
          </TabsContent>

          <TabsContent value="communication">
            <MaintenanceChatTab requestId={request.id || ''} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceRequestModal;