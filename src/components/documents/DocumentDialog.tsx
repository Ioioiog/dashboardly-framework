import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@/utils/propertyUtils";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userRole: "landlord" | "tenant";
}

type DocumentType = "lease_agreement" | "invoice" | "receipt" | "other";

export function DocumentDialog({
  open,
  onOpenChange,
  userId,
  userRole,
}: DocumentDialogProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("other");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");

  // Fetch properties for landlord
  const { data: properties } = useQuery({
    queryKey: ["properties", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("landlord_id", userId);

      if (error) throw error;
      return data as Property[];
    },
    enabled: userRole === "landlord",
  });

  // Fetch tenants for selected property
  const { data: tenants } = useQuery({
    queryKey: ["property-tenants", selectedPropertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenancies")
        .select(`
          tenant_id,
          tenant:profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("property_id", selectedPropertyId)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPropertyId && userRole === "landlord",
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // For landlords, require property selection
    if (userRole === "landlord" && !selectedPropertyId) {
      toast({
        title: "Error",
        description: "Please select a property",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          name: file.name,
          file_path: filePath,
          uploaded_by: userId,
          document_type: documentType,
          property_id: userRole === "landlord" ? selectedPropertyId : null,
          tenant_id: selectedTenantId || null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Could not upload the document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          {userRole === "landlord" && (
            <>
              <div>
                <Label htmlFor="property">Select Property</Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={(value) => {
                    setSelectedPropertyId(value);
                    setSelectedTenantId(""); // Reset tenant selection when property changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPropertyId && (
                <div>
                  <Label htmlFor="tenant">Assign to Tenant (Optional)</Label>
                  <Select
                    value={selectedTenantId}
                    onValueChange={setSelectedTenantId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {tenants?.map((t) => (
                        <SelectItem key={t.tenant_id} value={t.tenant_id}>
                          {t.tenant.first_name} {t.tenant.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
          <div>
            <Label htmlFor="type">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={(value: DocumentType) => setDocumentType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}