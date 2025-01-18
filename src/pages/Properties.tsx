import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DashboardProperties } from "@/components/dashboard/DashboardProperties";
import { useState } from "react";
import { Property } from "@/utils/propertyUtils";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function Properties() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { userRole } = useUserRole();

  const handleEdit = async (property: Property, data: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("properties")
        .update(data)
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: t("properties.toast.updated.title"),
        description: t("properties.toast.updated.description"),
      });
      
      setShowDialog(false);
      return true;
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("properties.toast.error"),
      });
      return false;
    }
  };

  const handleDelete = async (property: Property) => {
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: t("properties.toast.deleted.title"),
        description: t("properties.toast.deleted.description"),
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("properties.toast.error"),
      });
      return false;
    }
  };

  if (!userRole) {
    return null; // Or loading state
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl space-y-8">
          <div className="space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {t("properties.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("properties.description")}
                </p>
              </div>

              {userRole === "landlord" && (
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("properties.actions.add")}
                </Button>
              )}
            </header>

            <div className="space-y-8">
              <DashboardProperties 
                userRole={userRole}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      <PropertyDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        property={selectedProperty}
        onSubmit={handleEdit}
        mode={selectedProperty ? "edit" : "add"}
      />
    </div>
  );
}