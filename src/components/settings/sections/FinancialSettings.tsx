import { InvoiceInfoForm } from "../InvoiceInfoForm";
import { StripeAccountForm } from "../StripeAccountForm";
import { useUserRole } from "@/hooks/use-user-role";
import { InvoiceGenerationInfo } from "./InvoiceGenerationInfo";
import { Separator } from "@/components/ui/separator";

export function FinancialSettings() {
  const { userRole } = useUserRole();

  if (userRole !== 'landlord') {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Financial & Payments Settings</h2>
      
      <InvoiceGenerationInfo />
      
      <Separator className="my-6" />
      
      <InvoiceInfoForm />
      
      <Separator className="my-6" />
      
      <StripeAccountForm />
    </div>
  );
}