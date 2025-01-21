import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { PaymentList } from "@/components/payments/PaymentList";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { PaymentFilters } from "@/components/payments/PaymentFilters";
import { PaymentWithRelations } from "@/integrations/supabase/types/payment";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { subDays, startOfYear } from "date-fns";

const Payments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [tenancies, setTenancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const fetchPayments = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          tenancy:tenancies (
            property:properties (
              name,
              address
            ),
            tenant:profiles (
              first_name,
              last_name,
              email
            )
          )
        `)
        .order("due_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch payments",
      });
    }
  };

  const fetchTenancies = async () => {
    try {
      const { data, error } = await supabase
        .from("tenancies")
        .select(`
          id,
          property:properties (
            name,
            address
          ),
          tenant:profiles (
            first_name,
            last_name
          )
        `)
        .eq("status", "active");

      if (error) throw error;
      setTenancies(data || []);
    } catch (error) {
      console.error("Error fetching tenancies:", error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch user profile",
          });
          return;
        }

        if (profile.role !== "landlord" && profile.role !== "tenant") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid user role",
          });
          return;
        }

        setUserRole(profile.role as "landlord" | "tenant");

        await Promise.all([fetchPayments(), fetchTenancies()]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in checkUser:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
        });
      }
    };

    checkUser();
  }, [navigate, toast]);

  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.tenancy.property.name.toLowerCase().includes(query) ||
        payment.tenancy.property.address.toLowerCase().includes(query) ||
        `${payment.tenancy.tenant.first_name} ${payment.tenancy.tenant.last_name}`.toLowerCase().includes(query) ||
        payment.tenancy.tenant.email.toLowerCase().includes(query)
      );
    }

    // Date range filter
    const now = new Date();
    switch (dateRange) {
      case "last7days":
        filtered = filtered.filter(payment => 
          new Date(payment.due_date) >= subDays(now, 7)
        );
        break;
      case "last30days":
        filtered = filtered.filter(payment => 
          new Date(payment.due_date) >= subDays(now, 30)
        );
        break;
      case "last90days":
        filtered = filtered.filter(payment => 
          new Date(payment.due_date) >= subDays(now, 90)
        );
        break;
      case "thisYear":
        filtered = filtered.filter(payment => 
          new Date(payment.due_date) >= startOfYear(now)
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [payments, statusFilter, searchQuery, dateRange]);

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
      <div className="flex-1 p-8 ml-64">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payments</CardTitle>
            <div className="flex items-center gap-4">
              {userRole === "landlord" && (
                <PaymentDialog
                  tenancies={tenancies}
                  onPaymentCreated={fetchPayments}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PaymentFilters
              status={statusFilter}
              onStatusChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <PaymentList payments={filteredPayments} userRole={userRole} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
