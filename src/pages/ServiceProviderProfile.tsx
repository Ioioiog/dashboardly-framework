import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceList } from "@/components/service-provider/ServiceList";
import { ServiceForm } from "@/components/service-provider/ServiceForm";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Building2, ClipboardList, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileSection } from "@/components/service-provider/ProfileSection";
import { ServiceAreaSection } from "@/components/service-provider/ServiceAreaSection";

type Section = 'profile' | 'services' | 'availability';

interface ServiceProviderProfile {
  id: string;
  business_name: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  service_area: string[] | null;
}

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

export default function ServiceProviderProfile() {
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log("Fetching service provider profile...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("service_provider_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

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

  const handleProfileUpdate = (updatedProfile: Partial<ServiceProviderProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection
            profile={profile}
            isLoading={isLoading}
            onProfileUpdate={handleProfileUpdate}
          />
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
          <ServiceAreaSection
            serviceAreas={profile?.service_area}
            onAreasUpdate={(areas) => handleProfileUpdate({ service_area: areas })}
          />
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