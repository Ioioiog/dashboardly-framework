import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Tenant {
  tenant_id: string;
  tenant: {
    first_name: string;
    last_name: string;
  };
}

interface TenantSelectProps {
  tenants?: Tenant[];
  selectedTenantId: string;
  onTenantChange: (value: string) => void;
}

export function TenantSelect({ tenants, selectedTenantId, onTenantChange }: TenantSelectProps) {
  return (
    <div>
      <Label htmlFor="tenant">Assign to Tenant (Optional)</Label>
      <Select
        value={selectedTenantId}
        onValueChange={onTenantChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select tenant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {tenants?.map((t) => (
            <SelectItem key={t.tenant_id} value={t.tenant_id}>
              {t.tenant.first_name} {t.tenant.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}