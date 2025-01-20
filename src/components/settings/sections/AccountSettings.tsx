import { useState, useEffect } from "react";
import { PersonalInfoForm } from "../PersonalInfoForm";
import { PasswordForm } from "../PasswordForm";
import { supabase } from "@/integrations/supabase/client";

export function AccountSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: null,
    last_name: null,
    email: null,
    phone: null
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No user found");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, phone")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          return;
        }

        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <PersonalInfoForm 
          initialProfile={profile}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <PasswordForm />
      </div>
    </div>
  );
}
