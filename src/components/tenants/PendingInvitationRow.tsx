import React from "react";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PendingInvitationRowProps {
  invitation: any;
}

export function PendingInvitationRow({ invitation }: PendingInvitationRowProps) {
  const property = invitation.tenant_invitation_properties?.[0]?.properties;

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
      <TableCell className="text-right">
        Expires: {format(new Date(invitation.expiration_date), "MMM d, yyyy")}
      </TableCell>
    </TableRow>
  );
}