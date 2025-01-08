import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/utils/propertyUtils";

interface PropertySelectProps {
  properties?: Property[];
  selectedPropertyId: string;
  onPropertyChange: (value: string) => void;
}

export function PropertySelect({ properties, selectedPropertyId, onPropertyChange }: PropertySelectProps) {
  return (
    <div>
      <Label htmlFor="property">Select Property</Label>
      <Select
        value={selectedPropertyId}
        onValueChange={onPropertyChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select property" />
        </SelectTrigger>
        <SelectContent>
          {properties?.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}