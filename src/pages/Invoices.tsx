import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { Invoice } from "@/types/invoice";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";

const Invoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const fetchInvoices = async () => {
    try {
      console.log("Fetching invoices...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const query = supabase
        .from("invoices")
        .select(`
          *,
          property:properties (
            name,
            address
          ),
          tenant:profiles!invoices_tenant_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order("due_date", { ascending: false });

      const { data: invoicesData, error: invoicesError } = await query;

      if (invoicesError) throw invoicesError;

      console.log("Fetched invoices:", invoicesData);
      setInvoices(invoicesData as Invoice[]);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch invoices",
      });
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      const searchContent = `
        ${invoice.property?.name || ""} 
        ${invoice.property?.address || ""} 
        ${invoice.tenant?.first_name || ""} 
        ${invoice.tenant?.last_name || ""} 
        ${invoice.tenant?.email || ""}
      `.toLowerCase();
      
      const matchesSearch = searchTerm === "" || searchContent.includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange?.from && dateRange?.to) {
        const invoiceDate = parseISO(invoice.due_date);
        matchesDateRange = isWithinInterval(invoiceDate, {
          start: dateRange.from,
          end: dateRange.to,
        });
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [invoices, searchTerm, statusFilter, dateRange]);

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
        await fetchInvoices();
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
            <CardTitle>Invoices</CardTitle>
            {userRole === "landlord" && (
              <InvoiceDialog onInvoiceCreated={fetchInvoices} />
            )}
          </CardHeader>
          <CardContent>
            <InvoiceFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            <InvoiceList 
              invoices={filteredInvoices} 
              userRole={userRole} 
              onStatusUpdate={fetchInvoices}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;