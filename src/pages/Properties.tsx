import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardProperties } from "@/components/dashboard/DashboardProperties";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Property, addProperty, updateProperty, deleteProperty } from "@/utils/propertyUtils";

const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to auth");
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Could not fetch user profile",
          variant: "destructive",
        });
        return;
      }

      if (profile?.role) {
        setUserRole(profile.role as "landlord" | "tenant");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Properties page auth state changed:", event);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleAdd = async (data: any) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      await addProperty({ ...data, landlord_id: user.id });
      setShowAddModal(false);
      toast({ title: "Success", description: "Property added successfully" });
      return true;
    } catch (error: any) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: error.message || "Could not add property",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (property: Property, data: any) => {
    try {
      setIsSubmitting(true);
      await updateProperty(property.id, data);
      setShowEditModal(false);
      setSelectedProperty(null);
      toast({ title: "Success", description: "Property updated successfully" });
      return true;
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: error.message || "Could not update property",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (property: Property) => {
    try {
      setIsSubmitting(true);
      await deleteProperty(property.id);
      setShowDeleteDialog(false);
      setSelectedProperty(null);
      toast({ title: "Success", description: "Property deleted successfully" });
      return true;
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: error.message || "Could not delete property",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {t('properties.title')}
              </h1>
              <p className="mt-2 text-dashboard-text">
                {t('properties.description')}
              </p>
            </div>
            {userRole === "landlord" && (
              <Button 
                className="flex items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" />
                {t('properties.addProperty')}
              </Button>
            )}
          </header>

          {userRole && (
            <div className="space-y-8">
              <DashboardProperties 
                userRole={userRole}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </main>

      {/* Add Property Dialog */}
      <PropertyDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={async (data) => {
          if (!userId) return;
          const success = await handleAdd(data);
          if (success) {
            setShowAddModal(false);
          }
        }}
        mode="add"
        isSubmitting={isSubmitting}
      />

      {/* Edit Property Dialog */}
      <PropertyDialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSubmit={async (data) => {
          if (!selectedProperty) return;
          const success = await handleEdit(selectedProperty, data);
          if (success) {
            setShowEditModal(false);
            setSelectedProperty(null);
          }
        }}
        property={selectedProperty || undefined}
        mode="edit"
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('properties.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('properties.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedProperty) return;
                const success = await handleDelete(selectedProperty);
                if (success) {
                  setShowDeleteDialog(false);
                  setSelectedProperty(null);
                }
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Properties;
