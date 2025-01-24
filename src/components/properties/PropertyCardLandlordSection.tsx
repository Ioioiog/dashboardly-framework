import React, { useState } from "react";
import { Calendar, UserMinus, UserPlus, Save } from "lucide-react";
import { format } from "date-fns";
import { Property } from "@/utils/propertyUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PropertyCardLandlordSectionProps {
  property: Property;
  isDeleting: boolean;
  onDeleteTenancy: () => void;
  onAssignTenant: () => void;
}

export function PropertyCardLandlordSection({ 
  property, 
  isDeleting, 
  onDeleteTenancy, 
  onAssignTenant 
}: PropertyCardLandlordSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState(property.tenancy?.start_date || '');
  const [endDate, setEndDate] = useState(property.tenancy?.end_date || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveDates = async () => {
    if (!property.tenancy) return;
    
    try {
      setIsSaving(true);
      console.log("Updating tenancy dates for property:", property.id);
      
      const { error } = await supabase
        .from('tenancies')
        .update({ 
          start_date: startDate,
          end_date: endDate 
        })
        .eq('property_id', property.id)
        .eq('status', 'active');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenancy dates have been updated",
      });

      setIsEditing(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating tenancy dates:', error);
      toast({
        title: "Error",
        description: "Failed to update tenancy dates",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h4 className="font-medium text-gray-900">Current Tenant</h4>
      {property.tenancy ? (
        <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveDates}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Start Date: {format(new Date(property.tenancy.start_date), 'PPP')}
              </p>
              {property.tenancy.end_date && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  End Date: {format(new Date(property.tenancy.end_date), 'PPP')}
                </p>
              )}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Edit Dates
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteTenancy}
                  disabled={isDeleting}
                  className="flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <UserMinus className="h-4 w-4" />
                  {isDeleting ? "Removing..." : "Remove Tenant"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">No tenant assigned</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onAssignTenant}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Assign Tenant
          </Button>
        </div>
      )}
    </div>
  );
}