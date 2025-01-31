import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

export default function ServiceAreas() {
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  const fetchServiceAreas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("service_provider_profiles")
        .select("service_area")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setServiceAreas(data?.service_area || []);
    } catch (error) {
      console.error("Error fetching service areas:", error);
      toast({
        title: "Error",
        description: "Failed to load service areas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddArea = async () => {
    if (!newArea.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const updatedAreas = [...serviceAreas, newArea.trim()];
      
      const { error } = await supabase
        .from("service_provider_profiles")
        .update({ service_area: updatedAreas })
        .eq("id", user.id);

      if (error) throw error;

      setServiceAreas(updatedAreas);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const updatedAreas = serviceAreas.filter(area => area !== areaToRemove);
      
      const { error } = await supabase
        .from("service_provider_profiles")
        .update({ service_area: updatedAreas })
        .eq("id", user.id);

      if (error) throw error;

      setServiceAreas(updatedAreas);
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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-dashboard-background to-gray-50">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-dashboard-background to-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new service area (e.g., New York City)"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddArea();
                      }
                    }}
                  />
                  <Button onClick={handleAddArea}>Add Area</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {serviceAreas.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                    >
                      <span>{area}</span>
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
        </div>
      </main>
    </div>
  );
}