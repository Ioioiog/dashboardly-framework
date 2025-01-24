import React from "react";
import { BarChart2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/utils/propertyUtils";

interface PropertyCardFooterProps {
  property: Property;
  userRole: "landlord" | "tenant";
  viewMode?: "grid" | "list";
  onShowUtilityStats: () => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyCardFooter({ 
  property, 
  userRole, 
  viewMode = "grid",
  onShowUtilityStats,
  onEdit,
  onDelete 
}: PropertyCardFooterProps) {
  return (
    <div className={`px-6 py-4 bg-gray-50 ${viewMode === "list" ? "border-l" : ""} border-t border-gray-100`}>
      <div className="flex flex-row justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowUtilityStats}
          className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <BarChart2 className="h-4 w-4" />
          Analyze Invoice History
        </Button>
        {userRole === "landlord" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(property)}
              className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(property)}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}