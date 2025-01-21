import { MonthlyRevenue } from "../types/revenue";
import { addMonths, format, parseISO, isBefore, endOfMonth } from "date-fns";
import { formatMonthDisplay } from "./dateUtils";
import { supabase } from "@/integrations/supabase/client";

interface TenancyRevenue {
  property_id: string;
  property_name: string;
  monthly_rent: number;
  end_date: string | null;
}

async function getFutureRentalRevenue(userId: string): Promise<TenancyRevenue[]> {
  console.log("Fetching future rental revenue for user:", userId);
  
  const { data: tenancies, error } = await supabase
    .from('tenancies')
    .select(`
      property_id,
      end_date,
      properties (
        name,
        monthly_rent
      )
    `)
    .eq('status', 'active')
    .eq('properties.landlord_id', userId);

  if (error) {
    console.error('Error fetching future rental revenue:', error);
    return [];
  }

  console.log("Found active tenancies:", tenancies);
  
  return tenancies.map(tenancy => ({
    property_id: tenancy.property_id,
    property_name: tenancy.properties.name,
    monthly_rent: tenancy.properties.monthly_rent,
    end_date: tenancy.end_date
  }));
}

export async function calculatePredictedRevenue(
  historicalData: MonthlyRevenue[],
  userId: string
): Promise<MonthlyRevenue[]> {
  console.log("Calculating predicted revenue with historical data:", historicalData);
  
  if (historicalData.length < 2) return [];

  // Get future rental revenue from active tenancies
  const futureRents = await getFutureRentalRevenue(userId);
  console.log("Future rental revenue:", futureRents);
  
  // Generate predictions for the next 12 months
  const predictions: MonthlyRevenue[] = [];
  const lastMonth = new Date(historicalData[historicalData.length - 1].month);
  
  for (let i = 1; i <= 12; i++) {
    const predictionDate = addMonths(lastMonth, i);
    const monthEnd = endOfMonth(predictionDate);

    // Calculate total rent from active tenancies for this month
    const monthlyRents = futureRents.reduce((sum, tenancy) => {
      if (!tenancy.end_date || isBefore(predictionDate, parseISO(tenancy.end_date))) {
        return sum + tenancy.monthly_rent;
      }
      return sum;
    }, 0);

    console.log(`Month ${i} total rent:`, monthlyRents);

    // Create property breakdown for the tooltip
    const propertyBreakdown = futureRents
      .filter(tenancy => !tenancy.end_date || isBefore(predictionDate, parseISO(tenancy.end_date)))
      .map(tenancy => ({
        name: tenancy.property_name,
        total: tenancy.monthly_rent,
        count: 1
      }));

    predictions.push({
      month: formatMonthDisplay(format(predictionDate, 'yyyy-MM-dd')),
      revenue: monthlyRents,
      count: propertyBreakdown.length,
      average: monthlyRents / (propertyBreakdown.length || 1),
      propertyBreakdown
    });
  }

  console.log("Final predictions:", predictions);
  return predictions;
}