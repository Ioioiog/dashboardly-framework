import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

const documentTypeLabels = {
  lease_agreement: "Lease Agreement",
  invoice: "Invoice",
  receipt: "Receipt",
  other: "Other",
};

export function DocumentCard({ document: doc, userRole }: DocumentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="truncate">{doc.name}</span>
          </CardTitle>
          <Badge variant="secondary">
            {documentTypeLabels[doc.document_type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {doc.property && (
            <div>
              <p className="text-sm font-medium text-gray-500">Property</p>
              <p className="text-sm">{doc.property.name}</p>
            </div>
          )}
          {doc.tenant && (
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned Tenant</p>
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-4 w-4" />
                <span>
                  {doc.tenant.first_name} {doc.tenant.last_name}
                </span>
              </div>
              {doc.tenant.email && (
                <p className="text-sm text-gray-500">{doc.tenant.email}</p>
              )}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Uploaded</p>
            <p className="text-sm">
              {format(new Date(doc.created_at), "PPP")}
            </p>
          </div>
          <DocumentActions 
            document={doc}
            userRole={userRole}
            onDocumentUpdated={() => {
              // Trigger a refetch of the documents list
              window.location.reload();
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}