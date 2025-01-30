import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gauge, Loader2 } from "lucide-react";
import { MeterReadingDialog } from "@/components/meter-readings/MeterReadingDialog";
import { MeterReadingList } from "@/components/meter-readings/MeterReadingList";
import { useProperties } from "@/hooks/useProperties";

const MeterReadings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { properties } = useProperties({ 
    userRole: userRole || "tenant" 
  });

  const fetchReadings = async () => {
    try {
      console.log("Fetching readings for user:", userId, "with role:", userRole);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log("No active session, redirecting to auth");
        navigate("/auth");
        return;
      }

      let query = supabase
        .from('meter_readings')
        .select(`
          *,
          property:properties (
            name,
            address,
            type,
            monthly_rent,
            created_at,
            updated_at
          )
        `)
        .order('reading_date', { ascending: false });

      if (userRole === 'tenant') {
        query = query.eq('tenant_id', userId);
      } else if (userRole === 'landlord') {
        query = query.in('property_id', properties.map(p => p.id));
      }

      const { data: readingsData, error: readingsError } = await query;

      if (readingsError) {
        console.error("Error fetching readings:", readingsError);
        throw readingsError;
      }

      console.log("Fetched readings:", readingsData);
      setReadings(readingsData || []);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error in meter readings page:", error);
      toast({
        variant: "destructive",
        title: "Error fetching readings",
        description: error.message || "An unexpected error occurred. Please try refreshing the page.",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No active session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Setting user role to:", profile.role);
        setUserRole(profile.role as "landlord" | "tenant");
        
        // Only fetch readings after we have the user role
        await fetchReadings();

      } catch (error: any) {
        console.error("Error in meter readings page:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred. Please try logging in again.",
        });
        setIsLoading(false);
      }
    };

    checkUser();
  }, [navigate, toast]);

  if (isLoading || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Gauge className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Meter Readings</CardTitle>
              </div>
              <p className="text-gray-500 max-w-2xl">
                Track and manage utility meter readings for your properties.
              </p>
            </div>
            <MeterReadingDialog
              properties={properties}
              onReadingCreated={fetchReadings}
              userRole={userRole}
              userId={userId}
            />
          </CardHeader>
          <CardContent>
            <MeterReadingList
              readings={readings}
              userRole={userRole}
              onUpdate={fetchReadings}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeterReadings;