import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";
import { useProperties } from "@/hooks/useProperties";
import { Calendar } from "lucide-react";

interface ReadingPeriod {
  id: string;
  property_id: string;
  utility_type: 'electricity' | 'water' | 'gas';
  start_day: number;
  end_day: number;
}

export function UtilityReadingPeriodsSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [utilityType, setUtilityType] = useState<'electricity' | 'water' | 'gas'>('electricity');
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [periods, setPeriods] = useState<ReadingPeriod[]>([]);
  const { toast } = useToast();
  const { userRole } = useUserRole();
  const { properties } = useProperties({ userRole: userRole || 'tenant' });

  const fetchPeriods = async () => {
    try {
      console.log('Fetching reading periods');
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from('utility_reading_periods')
        .select('*');

      if (error) throw error;

      console.log('Fetched periods:', data);
      setPeriods(data || []);
    } catch (error) {
      console.error('Error fetching reading periods:', error);
      toast({
        title: "Error",
        description: "Failed to load reading periods",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty || !startDay || !endDay) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const startDayNum = parseInt(startDay);
    const endDayNum = parseInt(endDay);

    if (startDayNum < 1 || startDayNum > 31 || endDayNum < 1 || endDayNum > 31) {
      toast({
        title: "Error",
        description: "Days must be between 1 and 31",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Adding new reading period');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { error } = await supabase
        .from('utility_reading_periods')
        .upsert({
          property_id: selectedProperty,
          utility_type: utilityType,
          start_day: startDayNum,
          end_day: endDayNum,
          landlord_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reading period saved successfully",
      });

      setStartDay("");
      setEndDay("");
      fetchPeriods();
    } catch (error) {
      console.error('Error saving reading period:', error);
      toast({
        title: "Error",
        description: "Failed to save reading period",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== 'landlord') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Utility Reading Periods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
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

            <Select
              value={utilityType}
              onValueChange={(value: 'electricity' | 'water' | 'gas') => setUtilityType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select utility type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Start Day (1-31)"
              min="1"
              max="31"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
            />

            <Input
              type="number"
              placeholder="End Day (1-31)"
              min="1"
              max="31"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Reading Period"}
          </Button>
        </form>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Current Reading Periods</h3>
          {periods.map((period) => (
            <div
              key={period.id}
              className="bg-gray-50 p-4 rounded-lg mb-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {properties?.find(p => p.id === period.property_id)?.name} - {period.utility_type}
                </p>
                <p className="text-sm text-gray-600">
                  Days {period.start_day} - {period.end_day} of each month
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}