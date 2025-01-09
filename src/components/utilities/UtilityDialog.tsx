import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/utils/propertyUtils";
import { Plus } from "lucide-react";

interface UtilityDialogProps {
  properties: Property[];
  onUtilityCreated: () => void;
}

export function UtilityDialog({ properties, onUtilityCreated }: UtilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async () => {
    if (!utilityType || !amount || !propertyId || !dueDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all required fields.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("utilities").insert([
        {
          type: utilityType,
          amount: parseFloat(amount),
          property_id: propertyId,
          due_date: dueDate,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Utility bill recorded successfully!",
      });
      setOpen(false);
      onUtilityCreated();
    } catch (error) {
      console.error("Error recording utility bill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record utility bill.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Utility Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Utility Bill</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Utility Type</Label>
            <Select value={utilityType} onValueChange={setUtilityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electricity">Electricity</SelectItem>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Gas">Gas</SelectItem>
                <SelectItem value="Internet">Internet</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="property">Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Utility Bill"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}