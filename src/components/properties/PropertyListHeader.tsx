import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ, Grid, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyListHeaderProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function PropertyListHeader({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy
}: PropertyListHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            {sortBy.includes("asc") ? <ArrowDownAZ className="mr-2 h-4 w-4" /> : <ArrowUpAZ className="mr-2 h-4 w-4" />}
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

      <div className="bg-gray-200 text-sm text-gray-500 leading-none border-2 border-gray-200 rounded-full inline-flex">
        <button
          onClick={() => setViewMode("grid")}
          className={`inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-l-full px-4 py-2 ${
            viewMode === "grid" ? "bg-white text-blue-400" : ""
          }`}
        >
          <Grid className="w-4 h-4 mr-2" />
          <span>Grid</span>
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-r-full px-4 py-2 ${
            viewMode === "list" ? "bg-white text-blue-400" : ""
          }`}
        >
          <List className="w-4 h-4 mr-2" />
          <span>List</span>
        </button>
      </div>
    </div>
  );
}