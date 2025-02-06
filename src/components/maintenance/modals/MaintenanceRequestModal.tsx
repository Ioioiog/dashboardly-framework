import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequestForm } from "../forms/MaintenanceRequestForm";
import { LandlordFields } from "../forms/LandlordFields";
import type { MaintenanceRequest } from "../hooks/useMaintenanceRequest";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Request Details</TabsTrigger>
            <TabsTrigger value="landlord">Landlord Actions</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <MaintenanceRequestForm
              existingRequest={request}
              onSubmit={onUpdateRequest}
              documents={documents}
              isLoadingDocuments={isLoadingDocuments}
              userRole={userRole || ''}
              properties={[]}
              serviceProviders={serviceProviders}
              isLoadingProviders={isLoadingProviders}
            />
          </TabsContent>
          <TabsContent value="landlord">
            <LandlordFields
              formData={request}
              onFieldChange={(field, value) => onUpdateRequest({ [field]: value })}
              isLoadingProviders={isLoadingProviders || false}
              userRole={userRole}
              isReadOnly={userRole !== 'landlord'}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}