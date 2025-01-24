import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PropertyFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  showOccupied: boolean;
  setShowOccupied: (value: boolean) => void;
  userRole?: "landlord" | "tenant";
}

export function PropertyFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  showOccupied,
  setShowOccupied,
  userRole,
}: PropertyFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="type">Property Type</Label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="House">House</SelectItem>
            <SelectItem value="Condo">Condo</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {userRole === 'landlord' && (
        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id="occupied"
            checked={showOccupied}
            onCheckedChange={setShowOccupied}
          />
          <Label htmlFor="occupied">Show only occupied properties</Label>
        </div>
      )}
    </div>
  );
}