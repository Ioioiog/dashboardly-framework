import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentDialog } from "@/components/documents/DocumentDialog";
import { DocumentType } from "@/integrations/supabase/types/document-types";

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>("all");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found, redirecting to auth");
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role) {
        setUserRole(profile.role as "landlord" | "tenant");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Documents page auth state changed:", event);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (!userId || !userRole) return null;

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Documents</h1>
                <p className="mt-2 text-dashboard-text">
                  Manage and view your property-related documents.
                </p>
              </div>
              {userRole === "landlord" && (
                <Button 
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </header>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <DocumentList 
              userId={userId} 
              userRole={userRole}
              propertyFilter={propertyFilter}
              typeFilter={typeFilter}
            />
          </div>
        </div>
      </main>

      <DocumentDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        userId={userId}
        userRole={userRole}
      />
    </div>
  );
};

export default Documents;