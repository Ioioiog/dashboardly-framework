import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceList } from "@/components/service-provider/ServiceList";
import { ServiceForm } from "@/components/service-provider/ServiceForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Building2, ClipboardList, MapPin, UserCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = 'profile' | 'services' | 'availability';

interface ServiceProviderProfile {
  business_name: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  service_area: string[] | null;
}

export default function ServiceProviderProfile() {
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [newArea, setNewArea] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const navigationItems = [
    {
      id: 'profile' as Section,
      label: 'Profile Information',
      icon: UserCircle,
    },
    {
      id: 'services' as Section,
      label: 'Services',
      icon: ClipboardList,
    },
    {
      id: 'availability' as Section,
      label: 'Service Areas',
      icon: Building2,
    },
  ];

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("service_provider_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      console.log("Fetched profile:", data);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      console.log("Updating profile with:", {
        business_name: profile.business_name,
        description: profile.description,
        contact_phone: profile.contact_phone,
        contact_email: profile.contact_email,
        website: profile.website
      });

      const { error } = await supabase
        .from("service_provider_profiles")
        .update({
          business_name: profile.business_name,
          description: profile.description,
          contact_phone: profile.contact_phone,
          contact_email: profile.contact_email,
          website: profile.website
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddArea = async () => {
    if (!newArea.trim() || !profile) return;

    try {
      const updatedAreas = [...(profile.service_area || []), newArea.trim()];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("service_provider_profiles")
        .update({ service_area: updatedAreas })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, service_area: updatedAreas });
      setNewArea("");
      toast({
        title: "Success",
        description: "Service area added successfully",
      });
    } catch (error) {
      console.error("Error adding service area:", error);
      toast({
        title: "Error",
        description: "Failed to add service area",
        variant: "destructive",
      });
    }
  };

  const handleRemoveArea = async (areaToRemove: string) => {
    if (!profile) return;

    try {
      const updatedAreas = profile.service_area?.filter(area => area !== areaToRemove) || [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("service_provider_profiles")
        .update({ service_area: updatedAreas })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, service_area: updatedAreas });
      toast({
        title: "Success",
        description: "Service area removed successfully",
      });
    } catch (error) {
      console.error("Error removing service area:", error);
      toast({
        title: "Error",
        description: "Failed to remove service area",
        variant: "destructive",
      });
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
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
                    value={profile?.business_name || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev!, business_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={profile?.description || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev!, description: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Describe your business and services"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={profile?.contact_phone || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev!, contact_phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your contact phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    value={profile?.contact_email || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev!, contact_email: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your contact email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile?.website || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev!, website: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your website URL"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button type="submit" disabled={isLoading}>
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        );
      case 'services':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Button onClick={() => setShowServiceForm(true)}>Add Service</Button>
            </CardHeader>
            <CardContent>
              <ServiceList onEdit={() => setShowServiceForm(true)} />
            </CardContent>
          </Card>
        );
      case 'availability':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Service Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Add new service area (e.g., New York City)"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddArea();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleAddArea}>Add Area</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {profile?.service_area?.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{area}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveArea(area)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-dashboard-background to-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="w-full flex gap-4 bg-card p-4 rounded-lg shadow-sm overflow-x-auto">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className={cn(
                  "flex-shrink-0 gap-2",
                  activeSection === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            {renderSection()}
          </div>
        </div>

        <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
          <DialogContent>
            <ServiceForm onSuccess={() => setShowServiceForm(false)} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}