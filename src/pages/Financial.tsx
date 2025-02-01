import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DollarSign, FileText, CreditCard } from "lucide-react";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { PaymentList } from "@/components/payments/PaymentList";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { PaymentFilters } from "@/components/payments/PaymentFilters";
import { useUserRole } from "@/hooks/use-user-role";
import { usePayments } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";

type FinancialSection = 'invoices' | 'payments';

const Financial = () => {
  const [activeSection, setActiveSection] = useState<FinancialSection>('invoices');
  const { userRole } = useUserRole();
  const {
    payments,
    tenancies,
    isLoading: isPaymentsLoading,
    statusFilter: paymentStatusFilter,
    setStatusFilter: setPaymentStatusFilter,
    searchQuery: paymentSearchQuery,
    setSearchQuery: setPaymentSearchQuery,
    dateRange: paymentDateRange,
    setDateRange: setPaymentDateRange,
    fetchPayments
  } = usePayments();

  const {
    invoices,
    isLoading: isInvoicesLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    fetchInvoices
  } = useInvoices();

  const navigationItems = [
    {
      id: 'invoices' as FinancialSection,
      label: 'Invoices',
      icon: FileText,
    },
    {
      id: 'payments' as FinancialSection,
      label: 'Payments',
      icon: CreditCard,
    },
  ];

  // Only allow landlord or tenant roles to access this page
  if (userRole === "service_provider") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600">This section is only available for landlords and tenants.</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    // Early return if role is not landlord or tenant
    if (!userRole || userRole === "service_provider") return null;

    switch (activeSection) {
      case 'invoices':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold">Invoices</h2>
                </div>
                <p className="text-sm md:text-base text-gray-500">
                  Manage and track all your property-related invoices.
                </p>
              </div>
              {userRole === "landlord" && (
                <InvoiceDialog onInvoiceCreated={fetchInvoices} />
              )}
            </div>
            <InvoiceFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            <InvoiceList
              invoices={invoices}
              userRole={userRole}
              onStatusUpdate={fetchInvoices}
            />
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold">Payments</h2>
                </div>
                <p className="text-sm md:text-base text-gray-500">
                  Track and manage all property-related payments.
                </p>
              </div>
              {userRole === "landlord" && (
                <PaymentDialog
                  tenancies={tenancies}
                  onPaymentCreated={fetchPayments}
                />
              )}
            </div>
            <PaymentFilters
              status={paymentStatusFilter}
              onStatusChange={setPaymentStatusFilter}
              searchQuery={paymentSearchQuery}
              onSearchChange={setPaymentSearchQuery}
              dateRange={paymentDateRange}
              onDateRangeChange={setPaymentDateRange}
            />
            <PaymentList payments={payments} userRole={userRole} />
          </div>
        );
    }
  };

  if (isPaymentsLoading || isInvoicesLoading || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="w-full flex gap-4 bg-card p-4 rounded-lg shadow-sm overflow-x-auto">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className={cn(
                  "flex-shrink-0 gap-2",
                  activeSection === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          <Card className="p-6">
            {renderSection()}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Financial;