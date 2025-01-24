import React from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PendingInvitationCardProps {
  invitation: any;
}

export function PendingInvitationCard({ invitation }: PendingInvitationCardProps) {
  const property = invitation.tenant_invitation_properties?.[0]?.properties;

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
    </Card>
  );
}