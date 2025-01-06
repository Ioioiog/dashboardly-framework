import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    file_path: string;
    created_at: string;
    property: {
      name: string;
      address: string;
    } | null;
  };
  userRole: "landlord" | "tenant";
}

export function DocumentCard({ document: doc, userRole }: DocumentCardProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(doc.file_path);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Could not download the document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Could not delete the document",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="truncate">{doc.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {doc.property && (
            <div>
              <p className="text-sm font-medium text-gray-500">Property</p>
              <p className="text-sm">{doc.property.name}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Uploaded</p>
            <p className="text-sm">
              {format(new Date(doc.created_at), "PPP")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {userRole === "landlord" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}