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

  console.log("Properties page - User Role:", userRole);

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
      
      // Ensure we're sending a properly formatted update object
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
    <div className="flex h-screen bg-[#F6F6F7]">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <header className="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg p-8 animate-fade-in border border-[#eee]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1EAEDB] to-[#0FA0CE] bg-clip-text text-transparent">
                    {t(`properties.title.${userRole}`)}
                  </h1>
                  <p className="mt-2 text-[#888888] leading-relaxed max-w-2xl">
                    {t(`properties.description.${userRole}`)}
                  </p>
                </div>

                {userRole === "landlord" && (
                  <Button 
                    onClick={() => setShowDialog(true)}
                    className="w-full sm:w-auto bg-[#1EAEDB] hover:bg-[#0FA0CE] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("properties.addProperty")}
                  </Button>
                )}
              </div>
            </header>

            <div className="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-[#eee]">
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
        onSubmit={handleEdit}
        mode={selectedProperty ? "edit" : "add"}
      />
    </div>
  );
}