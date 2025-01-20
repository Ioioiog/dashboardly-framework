import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tenant } from "@/types/tenant";
import { EditTenantDialog } from "./EditTenantDialog";

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { t } = useTranslation();

  const handleUpdate = () => {
    console.log("Tenant updated, refreshing list");
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('tenants.list.name')}</TableHead>
            <TableHead>{t('tenants.list.contact')}</TableHead>
            <TableHead>{t('tenants.list.property')}</TableHead>
            <TableHead>{t('tenants.list.startDate')}</TableHead>
            <TableHead>{t('tenants.list.endDate')}</TableHead>
            <TableHead>{t('tenants.list.status')}</TableHead>
            <TableHead>{t('tenants.list.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell>
                {tenant.first_name} {tenant.last_name}
              </TableCell>
              <TableCell>
                <div>{tenant.email}</div>
                <div className="text-sm text-gray-500">{tenant.phone}</div>
              </TableCell>
              <TableCell>
                <div>{tenant.property.name}</div>
                <div className="text-sm text-gray-500">
                  {tenant.property.address}
                </div>
              </TableCell>
              <TableCell>
                {new Date(tenant.tenancy.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {tenant.tenancy.end_date
                  ? new Date(tenant.tenancy.end_date).toLocaleDateString()
                  : t('tenants.list.noEndDate')}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tenant.tenancy.status === "active" ? "default" : "secondary"
                  }
                >
                  {t(`tenants.status.${tenant.tenancy.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <EditTenantDialog tenant={tenant} onUpdate={handleUpdate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}