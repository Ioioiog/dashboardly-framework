import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RoleSpecificFormProps {
  role: string;
  email: string;
  onComplete: () => void;
}

export function RoleSpecificForm({ role, email, onComplete }: RoleSpecificFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    businessName: "",
    serviceArea: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Starting role-specific form submission for role:", role);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user found");
      }

      console.log("Updating user metadata and profile for user:", user.id);
      
      // First update the user's metadata with role
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          role: role,
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      });

      if (updateError) {
        console.error("Error updating user metadata:", updateError);
        throw updateError;
      }

      console.log("Successfully updated user metadata with role:", role);

      // Then update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: role,
          email: email
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log("Successfully updated profile with role:", role);

      // If user is a service provider, create/update service provider profile
      if (role === 'service_provider') {
        console.log("Creating service provider profile");
        
        const { error: spError } = await supabase
          .from('service_provider_profiles')
          .upsert({
            id: user.id,
            business_name: formData.businessName,
            service_area: [formData.serviceArea],
            contact_email: email,
            contact_phone: formData.phone
          }, {
            onConflict: 'id'
          });

        if (spError) {
          console.error("Error updating service provider profile:", spError);
          throw spError;
        }

        console.log("Successfully created service provider profile");
      }

      // Verify the role was set correctly
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (verifyError) {
        console.error("Error verifying profile update:", verifyError);
      } else {
        console.log("Verified profile role:", verifyProfile.role);
      }

      // Refresh the session to ensure role changes are reflected
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Error refreshing session:", refreshError);
      } else {
        console.log("Successfully refreshed session");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {role === 'service_provider' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceArea">Service Area</Label>
            <Input
              id="serviceArea"
              name="serviceArea"
              value={formData.serviceArea}
              onChange={handleChange}
              placeholder="e.g. New York City"
              required
            />
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Complete Profile"}
      </Button>
    </form>
  );
}