import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function Utilities() {
  const [utilities, setUtilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useUserRole();

  useEffect(() => {
    fetchUtilities();
  }, []);

  const fetchUtilities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("utilities")
        .select("*");

      if (error) throw error;
      setUtilities(data || []);
    } catch (error) {
      console.error("Error fetching utilities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userRole) return null;

  return (
    <DashboardSidebar>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Utilities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading utilities...</div>
          ) : (
            <div>
              {utilities.length === 0 ? (
                <div className="text-center py-6">No utilities found.</div>
              ) : (
                <ul>
                  {utilities.map((utility) => (
                    <li key={utility.id}>{utility.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardSidebar>
  );
}
