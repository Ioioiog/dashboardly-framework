import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  business_name: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
}

interface ProfileSectionProps {
  profile: ProfileData | null;
  isLoading: boolean;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
}

export function ProfileSection({ profile, isLoading, onProfileUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData | null>(profile);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsSaving(true);
    console.log("Submitting profile update:", formData);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No user found");
      }

      console.log("Updating profile for user:", user.id);
      const { error } = await supabase
        .from("service_provider_profiles")
        .update({
          business_name: formData.business_name,
          description: formData.description,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      onProfileUpdate(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Provider Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              name="business_name"
              value={formData?.business_name || ""}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              placeholder="Enter your business name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData?.description || ""}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              placeholder="Describe your business and services"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              value={formData?.contact_phone || ""}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              placeholder="Enter your contact phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              value={formData?.contact_email || ""}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              placeholder="Enter your contact email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData?.website || ""}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              placeholder="Enter your website URL"
            />
          </div>
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}