import { FileText } from "lucide-react";

interface EmptyDocumentStateProps {
  userRole: "landlord" | "tenant";
}

export function EmptyDocumentState({ userRole }: EmptyDocumentStateProps) {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No documents</h3>
      <p className="mt-2 text-sm text-gray-500">
        {userRole === "landlord"
          ? "Upload documents to share with your tenants."
          : "No documents have been shared with you yet."}
      </p>
    </div>
  );
}