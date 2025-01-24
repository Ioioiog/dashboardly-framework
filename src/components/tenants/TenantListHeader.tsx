import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface TenantListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}

export function TenantListHeader({
  searchTerm,
  onSearchChange,
  showInactive,
  onShowInactiveChange,
  viewMode,
  onViewModeChange,
}: TenantListHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Tenants</Label>
        <Input
          id="search"
          placeholder="Search by name, email, or property..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowInactiveChange(!showInactive)}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          {showInactive ? "Hide Inactive & Pending" : "Show Inactive & Pending"}
        </Button>
        <div className="bg-gray-200 text-sm text-gray-500 leading-none border-2 border-gray-200 rounded-full inline-flex">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-l-full px-4 py-2",
              viewMode === "grid" ? "bg-white text-blue-400" : ""
            )}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-blue-400 focus:text-blue-400 rounded-r-full px-4 py-2",
              viewMode === "list" ? "bg-white text-blue-400" : ""
            )}
          >
            <List className="w-4 h-4 mr-2" />
            <span>List</span>
          </button>
        </div>
      </div>
    </div>
  );
}