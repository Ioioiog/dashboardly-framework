import React from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PendingInvitationCardProps {
  invitation: any;
}

export function PendingInvitationCard({ invitation }: PendingInvitationCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const property = invitation.tenant_invitation_properties?.[0]?.properties;

  const handleDelete = async () => {
    try {
      console.log("Deleting invitation:", invitation.id);
      
      const { error: deleteError } = await supabase
        .from('tenant_invitations')
        .delete()
        .eq('id', invitation.id);

      if (deleteError) {
        console.error("Error deleting invitation:", deleteError);
        throw deleteError;
      }

      toast({
        title: "Success",
        description: "Invitation deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["tenant-invitations"] });
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  const handleResend = async () => {
    try {
      console.log("Resending invitation:", invitation.id);

      // Get property details for the email
      const { data: propertyDetails, error: propertyError } = await supabase
        .from('properties')
        .select('name, address')
        .in('id', invitation.tenant_invitation_properties.map(tip => tip.property_id));

      if (propertyError) throw propertyError;

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke(
        'send-tenant-invitation',
        {
          body: {
            email: invitation.email,
            firstName: invitation.first_name,
            lastName: invitation.last_name,
            properties: propertyDetails,
            token: invitation.token,
            startDate: invitation.start_date,
            endDate: invitation.end_date
          }
        }
      );

      if (emailError) throw emailError;

      toast({
        title: "Success",
        description: "Invitation resent successfully",
      });
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-semibold">
          {invitation.first_name} {invitation.last_name}
        </h3>
        <Badge className="bg-yellow-500">Pending Invitation</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{invitation.email}</p>
          {property && (
            <p className="text-sm">{property.name} ({property.address})</p>
          )}
          <div className="text-sm">
            <p>Start: {format(new Date(invitation.start_date), "MMM d, yyyy")}</p>
            <p>End: {invitation.end_date ? format(new Date(invitation.end_date), "MMM d, yyyy") : "Ongoing"}</p>
            <p>Expires: {format(new Date(invitation.expiration_date), "MMM d, yyyy")}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResend}
          title="Resend invitation"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          title="Delete invitation"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </CardFooter>
    </Card>
  );
}
