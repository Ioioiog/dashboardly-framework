import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentWithRelations } from "@/integrations/supabase/types/payment";

export const usePayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [tenancies, setTenancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const initialize = async () => {
      try {
        await Promise.all([fetchPayments(), fetchTenancies()]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in initialization:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
        });
      }
    };

    initialize();
  }, []);

  return {
    payments,
    tenancies,
    isLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    fetchPayments,
  };
};