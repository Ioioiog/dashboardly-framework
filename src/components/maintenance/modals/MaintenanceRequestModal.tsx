import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Users, DollarSign, MessageSquare, FileText, Info } from "lucide-react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { MaintenanceProgressTab } from "../tabs/MaintenanceProgressTab";
import { MaintenanceProviderTab } from "../tabs/MaintenanceProviderTab";
import { MaintenanceCostsTab } from "../tabs/MaintenanceCostsTab";
import { MaintenanceChatTab } from "../tabs/MaintenanceChatTab";
import { MaintenanceDocumentTab } from "../tabs/MaintenanceDocumentTab";
import { MaintenanceDetailsTab } from "../tabs/MaintenanceDetailsTab";
import { useUserRole } from "@/hooks/use-user-role";
import { FileObject } from "@supabase/storage-js";

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
  documents,
  isLoadingDocuments
}: MaintenanceRequestModalProps) => {
  const { userRole } = useUserRole();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Maintenance Request Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Progress
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

          <TabsContent value="details">
            <MaintenanceDetailsTab 
              request={request}
              onUpdateRequest={onUpdateRequest}
            />
          </TabsContent>

          <TabsContent value="progress">
            <MaintenanceProgressTab 
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