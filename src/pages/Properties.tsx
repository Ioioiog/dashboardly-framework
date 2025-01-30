import { Building2, Plus } from "lucide-react";
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

  console.log("Properties page - User Role:", userRole);

  const handleAdd = async (data: any): Promise<boolean> => {
    try {
      console.log("Attempting to add new property:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const propertyData = {
        ...data,
        landlord_id: user.id
      };

      const { error } = await supabase
        .from("properties")
        .insert(propertyData);

      if (error) {
        console.error("Error adding property:", error);
        throw error;
      }

      toast({
        title: t("properties.toast.success.added"),
        description: t("properties.toast.success.propertyAdded"),
      });
      
      setShowDialog(false);
      return true;
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("properties.toast.error.add"),
      });
      return false;
    }
  };

  const handleEdit = async (property: Property, data: any): Promise<boolean> => {
    try {
      if (!property.id) {
        console.error("No property ID provided for update");
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: "Invalid property data",
        });
        return false;
      }

      console.log("Attempting to edit property:", property.id, data);
      
      const updateData = {
        name: data.name,
        address: data.address,
        monthly_rent: data.monthly_rent,
        type: data.type,
        description: data.description || null,
        available_from: data.available_from || null
      };

      console.log("Formatted update data:", updateData);

      const { error } = await supabase
        .from("properties")
        .update(updateData)
        .eq("id", property.id);

      if (error) {
        console.error("Error updating property:", error);
        throw error;
      }

      toast({
        title: t("properties.toast.success.updated"),
        description: t("properties.toast.success.updated"),
      });
      
      setShowDialog(false);
      return true;
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("properties.toast.error.update"),
      });
      return false;
    }
  };

  const handleDelete = async (property: Property) => {
    try {
      console.log("Attempting to delete property:", property.id);
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: t("properties.toast.success.deleted"),
        description: t("properties.toast.success.deleted"),
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("properties.toast.error.delete"),
      });
      return false;
    }
  };

  if (!userRole) {
    console.log("No user role found, returning null");
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-dashboard-background to-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <header className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl animate-fade-in">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                      {t(`properties.title.${userRole}`)}
                    </h1>
                  </div>
                  <p className="text-gray-500 leading-relaxed max-w-2xl">
                    {t(`properties.description.${userRole}`)}
                  </p>
                </div>

                {userRole === "landlord" && (
                  <Button 
                    onClick={() => {
                      setSelectedProperty(null);
                      setShowDialog(true);
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t("properties.addProperty")}
                  </Button>
                )}
              </div>
            </header>

            <div className="bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <DashboardProperties 
                  userRole={userRole}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <PropertyDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        property={selectedProperty}
        onSubmit={selectedProperty ? handleEdit : handleAdd}
        mode={selectedProperty ? "edit" : "add"}
      />
    </div>
  );
}
