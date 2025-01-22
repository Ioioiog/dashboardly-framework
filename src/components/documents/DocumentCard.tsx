import { Card, CardContent } from "@/components/ui/card";
import { FileText, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DocumentActions } from "./DocumentActions";

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    file_path: string;
    created_at: string;
    document_type: "lease_agreement" | "invoice" | "receipt" | "other";
    property: {
      id: string;
      name: string;
      address: string;
    } | null;
    tenant_id?: string | null;
    tenant?: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    } | null;
  };
  userRole: "landlord" | "tenant";
  viewMode: "grid" | "list";
}

const documentTypeLabels = {
  lease_agreement: "Lease Agreement",
  invoice: "Invoice",
  receipt: "Receipt",
  other: "Other",
};

export function DocumentCard({ document: doc, userRole, viewMode }: DocumentCardProps) {
  return (
    <div className={`p-4 ${viewMode === 'grid' ? 'h-full' : ''}`}>
      <div className={`flex ${viewMode === 'grid' ? 'flex-col space-y-4' : 'items-center justify-between'} gap-4`}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium truncate">{doc.name}</h3>
            {doc.property && (
              <p className="text-sm text-muted-foreground truncate">
                {doc.property.name}
              </p>
            )}
          </div>
        </div>
        
        <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center'} gap-3`}>
          {doc.tenant && (
            <div className="hidden sm:flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {doc.tenant.first_name} {doc.tenant.last_name}
              </span>
            </div>
          )}
          
          <Badge variant="secondary" className="flex-shrink-0">
            {documentTypeLabels[doc.document_type]}
          </Badge>
          
          <div className="hidden sm:block text-sm text-muted-foreground">
            {format(new Date(doc.created_at), "MMM d, yyyy")}
          </div>
          
          <DocumentActions 
            document={doc}
            userRole={userRole}
            onDocumentUpdated={() => {
              window.location.reload();
            }}
          />
        </div>
      </div>
    </div>
  );
}