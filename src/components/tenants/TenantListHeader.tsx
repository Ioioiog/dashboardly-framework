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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="w-full md:w-auto space-y-2">
        <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search Tenants</Label>
        <Input
          id="search"
          placeholder="Search by name, email, or property..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-[300px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowInactiveChange(!showInactive)}
          className={cn(
            "flex items-center gap-2 w-full sm:w-auto transition-colors",
            showInactive ? "bg-blue-50 text-blue-600 border-blue-200" : ""
          )}
        >
          <Users className="h-4 w-4" />
          {showInactive ? "Hide Inactive & Pending" : "Show Inactive & Pending"}
        </Button>
        <div className="bg-gray-100 rounded-lg p-1 flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </button>
        </div>
      </div>
    </div>
  );
}