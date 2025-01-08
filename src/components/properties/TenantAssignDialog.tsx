import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TenantAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyName: string;
}

export function TenantAssignDialog({
  open,
  onOpenChange,
  propertyId,
  propertyName,
}: TenantAssignDialogProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, check if a user with this email already exists
      console.log("Checking if user exists:", email);
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      let userId: string;

      if (existingUser) {
        console.log("User already exists, using existing account");
        userId = existingUser.id;
      } else {
        console.log("Creating new user account...");
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: "Schimba1!", // Default password
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: 'tenant'
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user account");
        
        userId = authData.user.id;
      }

      // Generate a unique token for the invitation
      const token = Math.random().toString(36).substring(2, 15);

      // Create the invitation record
      const { error: inviteError } = await supabase
        .from("tenant_invitations")
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          property_id: propertyId,
          token,
          start_date: startDate,
          end_date: endDate || null,
        });

      if (inviteError) throw inviteError;

      // Create the tenancy record
      console.log("Creating tenancy record...");
      const { error: tenancyError } = await supabase
        .from("tenancies")
        .insert({
          property_id: propertyId,
          tenant_id: userId,
          start_date: startDate,
          end_date: endDate || null,
          status: "active",
        });

      if (tenancyError) throw tenancyError;

      toast({
        title: "Success",
        description: "Tenant invitation sent and tenancy created successfully",
      });

      onOpenChange(false);
      // Reset form
      setEmail("");
      setFirstName("");
      setLastName("");
      setStartDate("");
      setEndDate("");
    } catch (error: any) {
      console.error("Error in tenant assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign tenant",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Tenant to Property</DialogTitle>
          <DialogDescription>
            Send an invitation to a tenant for property: {propertyName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tenant@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}