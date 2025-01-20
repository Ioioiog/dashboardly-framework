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

  const handleAdd = async (data: any): Promise<boolean> => {
    try {
      console.log("Adding new property with data:", data);
      
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Unable to get current user");
      }

      const { error } = await supabase
        .from("properties")
        .insert({
          name: data.name,
          address: data.address,
          monthly_rent: data.monthly_rent,
          type: data.type,
          description: data.description,
          available_from: data.available_from,
          landlord_id: user.id // Add the landlord_id
        })
        .select();

      if (error) throw error;

      toast({
        title: t("properties.toast.added.title"),
        description: t("properties.toast.added.description"),
      });
      
      setShowDialog(false);
      return true;
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("properties.toast.error"),
      });
      return false;
    }
  };

  const handleEdit = async (property: Property, data: any): Promise<boolean> => {
    try {
      console.log("Updating property:", property.id, "with data:", data);
      
      if (!property.id) {
        throw new Error("Property ID is required for updates");
      }

      const updateData = {
        name: data.name,
        address: data.address,
        monthly_rent: data.monthly_rent,
        type: data.type,
        description: data.description,
        available_from: data.available_from
      };

      const { error } = await supabase
        .from("properties")
        .update(updateData)
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
      if (!property.id) {
        throw new Error("Property ID is required for deletion");
      }

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
    return null;
  }

  return (
    <DashboardSidebar>
      <div className="p-8">
        <div className="space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {t("properties.title")}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {t("properties.description")}
              </p>
            </div>

            {userRole === "landlord" && (
              <Button 
                onClick={() => {
                  setSelectedProperty(null);
                  setShowDialog(true);
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("properties.addProperty")}
              </Button>
            )}
          </header>

          <div className="rounded-lg border bg-white shadow">
            <div className="p-6">
              <DashboardProperties 
                userRole={userRole}
                onEdit={(property, data) => {
                  setSelectedProperty(property);
                  return handleEdit(property, data);
                }}
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
        onSubmit={selectedProperty ? handleEdit : handleAdd}
        mode={selectedProperty ? "edit" : "add"}
      />
    </DashboardSidebar>
  );
}