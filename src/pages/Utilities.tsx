import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Utility {
  id: string;
  property_id: string;
  type: string;
  amount: number;
  due_date: string;
  status: string;
  property: {
    name: string;
    address: string;
  };
}

const Utilities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);

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

        const { data: utilitiesData, error: utilitiesError } = await supabase
          .from('utilities')
          .select(`
            *,
            property:properties (
              name,
              address
            )
          `)
          .order('due_date', { ascending: false });

        if (utilitiesError) {
          console.error("Error fetching utilities:", utilitiesError);
          throw utilitiesError;
        }

        console.log("Fetched utilities:", utilitiesData);
        setUtilities(utilitiesData);
        setIsLoading(false);

      } catch (error: any) {
        console.error("Error in utilities page:", error);
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">Loading utilities...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-8 ml-64">
        <Card>
          <CardHeader>
            <CardTitle>Utilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {utilities.map((utility) => (
                <Card key={utility.id} className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Property</div>
                      <div>{utility.property.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Type</div>
                      <div className="capitalize">{utility.type}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Amount</div>
                      <div>${utility.amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Due Date</div>
                      <div>{new Date(utility.due_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Card>
              ))}
              {utilities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No utilities found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Utilities;