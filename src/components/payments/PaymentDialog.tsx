import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface PaymentFormData {
  tenancy_id: string;
  amount: number;
  currency: string;
  due_date: string;
  status: string;
}

interface Tenancy {
  id: string;
  property: {
    name: string;
    address: string;
  };
  tenant: {
    first_name: string;
    last_name: string;
  };
}

interface PaymentDialogProps {
  tenancies: Tenancy[];
  onPaymentCreated: () => void;
}

export function PaymentDialog({ tenancies, onPaymentCreated }: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { availableCurrencies } = useCurrency();
  const form = useForm<PaymentFormData>({
    defaultValues: {
      amount: 0,
      status: "pending",
      due_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const { error } = await supabase.from("payments").insert([
        {
          tenancy_id: data.tenancy_id,
          amount: data.amount,
          currency: data.currency,
          due_date: data.due_date,
          status: data.status,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment has been recorded successfully.",
      });
      setOpen(false);
      onPaymentCreated();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record payment. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Payment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tenancy_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant & Property</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant and property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenancies.map((tenancy) => (
                        <SelectItem key={tenancy.id} value={tenancy.id}>
                          {tenancy.tenant.first_name} {tenancy.tenant.last_name} -{" "}
                          {tenancy.property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Create Payment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}