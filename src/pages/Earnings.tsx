import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthState } from "@/hooks/useAuthState";
import { format } from "date-fns";
import { DollarSign, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EarningsSummary {
  totalEarnings: number;
  completedJobs: number;
  averageJobValue: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
    title: string;
  }>;
}

const Earnings = () => {
  const { currentUserId } = useAuthState();

  const { data: earningsSummary, isLoading } = useQuery({
    queryKey: ["earnings-summary", currentUserId],
    enabled: !!currentUserId,
    queryFn: async (): Promise<EarningsSummary> => {
      console.log("Fetching earnings for user:", currentUserId);
      
      const { data: maintenanceRequests, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("assigned_to", currentUserId)
        .eq("status", "completed")
        .order("completion_date", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }

      const totalEarnings = maintenanceRequests?.reduce(
        (sum, job) => sum + (job.service_provider_fee || 0),
        0
      );

      const recentPayments = maintenanceRequests?.slice(0, 5).map((job) => ({
        id: job.id,
        amount: job.service_provider_fee || 0,
        date: job.completion_date,
        status: job.payment_status || "pending",
        title: job.title,
      }));

      return {
        totalEarnings: totalEarnings || 0,
        completedJobs: maintenanceRequests?.length || 0,
        averageJobValue:
          maintenanceRequests?.length > 0
            ? totalEarnings / maintenanceRequests.length
            : 0,
        recentPayments: recentPayments || [],
      };
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Earnings Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${earningsSummary?.totalEarnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Jobs
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {earningsSummary?.completedJobs}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Job Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${earningsSummary?.averageJobValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsSummary?.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{payment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.date && format(new Date(payment.date), "PPP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                    <span className="font-semibold">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {(!earningsSummary?.recentPayments ||
                earningsSummary.recentPayments.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  No recent payments found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;