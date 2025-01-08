import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/integrations/supabase/types/property";
import { DocumentType } from "@/integrations/supabase/types";

interface DocumentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: "all" | DocumentType;
  setTypeFilter: (value: "all" | DocumentType) => void;
  propertyFilter: string;
  setPropertyFilter: (value: string) => void;
  properties?: Property["Row"][];
}

export function DocumentFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  propertyFilter,
  setPropertyFilter,
  properties,
}: DocumentFiltersProps) {
  const handleTypeFilterChange = (value: string) => {
    if (value === "all" || ["lease_agreement", "invoice", "receipt", "other"].includes(value)) {
      setTypeFilter(value as "all" | DocumentType);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="type">Document Type</Label>
        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="receipt">Receipt</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="property">Property</Label>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All properties</SelectItem>
            {properties?.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}