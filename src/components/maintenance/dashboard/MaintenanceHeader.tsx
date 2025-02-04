import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaintenanceHeaderProps {
  priority: string;
  onPriorityChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MaintenanceHeader({
  priority,
  onPriorityChange,
  searchQuery,
  onSearchChange,
}: MaintenanceHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Property Maintenance Dashboard</h1>
        <p className="text-gray-500">Manage and oversee all maintenance requests</p>
      </div>
      
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Priority:</span>
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search requests..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}