import React from "react";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PendingInvitationRowProps {
  invitation: any;
}

export function PendingInvitationRow({ invitation }: PendingInvitationRowProps) {
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
    <TableRow>
      <TableCell>{`${invitation.first_name || ''} ${invitation.last_name || ''}`}</TableCell>
      <TableCell>{invitation.email}</TableCell>
      <TableCell>N/A</TableCell>
      <TableCell>
        {property ? `${property.name} (${property.address})` : 'N/A'}
      </TableCell>
      <TableCell>
        {format(new Date(invitation.start_date), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        {invitation.end_date ? format(new Date(invitation.end_date), "MMM d, yyyy") : "Ongoing"}
      </TableCell>
      <TableCell>
        <Badge className="bg-yellow-500">Pending Invitation</Badge>
      </TableCell>
      <TableCell className="space-x-2">
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
      </TableCell>
    </TableRow>
  );
}
