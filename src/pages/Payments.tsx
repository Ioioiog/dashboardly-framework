import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  tenancy: {
    property: {
      name: string;
      address: string;
    };
    tenant: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

const Payments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        // Get user profile to determine role
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

        console.log("User role:", profile.role);
        setUserRole(profile.role);

        // Fetch payments based on user role
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

        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch payments",
          });
          return;
        }

        console.log("Payments data:", paymentsData);
        setPayments(paymentsData);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  {userRole === "landlord" && <TableHead>Tenant</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.tenancy.property.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.tenancy.property.address}
                        </div>
                      </div>
                    </TableCell>
                    {userRole === "landlord" && (
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.tenancy.tenant.first_name} {payment.tenancy.tenant.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.tenancy.tenant.email}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{format(new Date(payment.due_date), "PPP")}</TableCell>
                    <TableCell>
                      {payment.paid_date
                        ? format(new Date(payment.paid_date), "PPP")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No payments found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;