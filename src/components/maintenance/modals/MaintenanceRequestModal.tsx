import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequestForm } from "../forms/MaintenanceRequestForm";
import { MaintenanceCostsTab } from "../tabs/MaintenanceCostsTab";
import { MaintenanceReviewTab } from "../tabs/MaintenanceReviewTab";
import { MaintenanceProviderTab } from "../tabs/MaintenanceProviderTab";
import { MaintenanceChatTab } from "../tabs/MaintenanceChatTab";
import { MaintenanceDocumentTab } from "../tabs/MaintenanceDocumentTab";
import type { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import type { MaintenanceFormValues } from "../forms/MaintenanceRequestForm";

interface MaintenanceRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
  documents?: any[];
  isLoadingDocuments?: boolean;
  userRole?: string;
  isLoadingProviders?: boolean;
  serviceProviders?: any[];
}

export default function MaintenanceRequestModal({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
  documents,
  isLoadingDocuments,
  userRole,
  isLoadingProviders,
  serviceProviders
}: MaintenanceRequestModalProps) {
  const handleFormSubmit = (values: MaintenanceFormValues) => {
    // Convert File objects to strings in the images array
    const processedValues = {
      ...values,
      images: values.images.map(image => 
        typeof image === 'string' ? image : URL.createObjectURL(image)
      )
    };
    
    onUpdateRequest(processedValues as Partial<MaintenanceRequest>);
  };

  const isOwner = userRole === 'tenant' && request.tenant_id === request.tenant_id;
  const canEditDetails = isOwner && request.status === 'pending';
  const canEditProvider = userRole === 'landlord' || (userRole === 'service_provider' && request.assigned_to === request.assigned_to);
  const canEditCosts = userRole === 'service_provider' && request.assigned_to === request.assigned_to;
  const canEditStatus = userRole === 'landlord';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="provider">Provider</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <MaintenanceRequestForm
              existingRequest={request}
              onSubmit={handleFormSubmit}
              userRole={userRole || ''}
              properties={[]}
              serviceProviders={serviceProviders}
              isLoadingProviders={isLoadingProviders}
              isSubmitting={false}
              isReadOnly={!canEditDetails}
            />
          </TabsContent>

          <TabsContent value="provider">
            <MaintenanceProviderTab
              request={request}
              onUpdateRequest={onUpdateRequest}
              userRole={userRole}
              isReadOnly={!canEditProvider}
            />
          </TabsContent>

          <TabsContent value="costs">
            <MaintenanceCostsTab
              request={request}
              onUpdateRequest={onUpdateRequest}
              userRole={userRole}
              isReadOnly={!canEditCosts}
            />
          </TabsContent>

          <TabsContent value="documents">
            <MaintenanceDocumentTab
              request={request}
              onUpdateRequest={onUpdateRequest}
              documents={documents}
              isLoading={isLoadingDocuments}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="chat">
            <MaintenanceChatTab requestId={request.id || ''} />
          </TabsContent>

          <TabsContent value="review">
            <MaintenanceReviewTab
              request={request}
              onUpdateRequest={onUpdateRequest}
              userRole={userRole}
              canEditStatus={canEditStatus}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}