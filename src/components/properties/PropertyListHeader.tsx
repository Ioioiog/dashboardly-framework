import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortOption = "name-asc" | "name-desc" | "rent-asc" | "rent-desc" | "date-asc" | "date-desc";

interface PropertyListHeaderProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export function PropertyListHeader({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
}: PropertyListHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
            Name (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
            Name (Z-A)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("rent-asc")}>
            Rent (Low to High)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("rent-desc")}>
            Rent (High to Low)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("date-asc")}>
            Date Added (Oldest)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("date-desc")}>
            Date Added (Newest)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1 border rounded-md">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}