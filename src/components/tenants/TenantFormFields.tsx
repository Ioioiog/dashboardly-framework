import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TenantDatePicker } from "./TenantDatePicker";

interface TenantFormFieldsProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    startDate: Date | null;
    endDate: Date | null;
    monthlyPayDay: string;
  };
  setFormData: (data: any) => void;
}

export function TenantFormFields({ formData, setFormData }: TenantFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={formData.firstName}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, firstName: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, lastName: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, email: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, phone: e.target.value }))
          }
        />
      </div>
      <TenantDatePicker
        label="Start Date"
        date={formData.startDate}
        onSelect={(date) => setFormData((prev: any) => ({ ...prev, startDate: date }))}
      />
      <TenantDatePicker
        label="End Date"
        date={formData.endDate}
        onSelect={(date) => setFormData((prev: any) => ({ ...prev, endDate: date }))}
      />
      <div className="space-y-2">
        <Label htmlFor="monthlyPayDay">Monthly Pay Day</Label>
        <Input
          id="monthlyPayDay"
          type="number"
          min="1"
          max="31"
          value={formData.monthlyPayDay}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, monthlyPayDay: e.target.value }))
          }
        />
      </div>
    </div>
  );
}