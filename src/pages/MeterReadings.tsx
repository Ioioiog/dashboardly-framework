import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MeterReadingDialog } from "@/components/meter-readings/MeterReadingDialog";
import { MeterReadingList } from "@/components/meter-readings/MeterReadingList";
import { useProperties } from "@/hooks/useProperties";
import { Loader2 } from "lucide-react";

interface MeterReading {
  id: string;
  property_id: string;
  tenant_id: string;
  reading_type: 'electricity' | 'water' | 'gas';
  reading_value: number;
  reading_date: string;
  notes: string | null;
  property: {
    name: string;
    address: string;
  };
}

const MeterReadings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { properties } = useProperties({ 
    userRole: userRole || "tenant" 
  });

  const fetchReadings = async () => {
    try {
      let query = supabase
        .from('meter_readings')
        .select(`
          *,
          property:properties (
            name,
            address
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
        title: "Error",
        description: error.message || "An unexpected error occurred",
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

        setUserRole(profile.role as "landlord" | "tenant");
        await fetchReadings();

      } catch (error: any) {
        console.error("Error in meter readings page:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred",
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
            <CardTitle>Meter Readings</CardTitle>
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