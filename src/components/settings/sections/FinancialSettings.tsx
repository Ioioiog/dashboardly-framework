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
    <div className="space-y-8">
      <InvoiceGenerationInfo />
      <Separator />
      <InvoiceInfoForm />
      <Separator />
      <StripeAccountForm />
    </div>
  );
}