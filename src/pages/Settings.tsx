import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PersonalInfoForm } from "@/components/settings/PersonalInfoForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { LanguageSelector } from "@/components/settings/LanguageSelector";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

const Settings = () => {
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("No user found");
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-dashboard-background">
        <DashboardSidebar />
        <main className="flex-1 p-8 ml-64">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Loading...</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dashboard-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
          
          <PersonalInfoForm
            initialProfile={profile}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          
          <PasswordForm />
          
          <LanguageSelector />
        </div>
      </main>
    </div>
  );
};

export default Settings;