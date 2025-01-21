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
  if (historicalData.length < 2) return [];

  // Calculate average month-over-month growth from historical data
  let totalGrowth = 0;
  for (let i = 1; i < historicalData.length; i++) {
    const currentRevenue = historicalData[i].revenue;
    const previousRevenue = historicalData[i - 1].revenue;
    if (previousRevenue > 0) {
      totalGrowth += (currentRevenue - previousRevenue) / previousRevenue;
    }
  }
  
  const averageGrowthRate = totalGrowth / (historicalData.length - 1);
  const averagePayments = historicalData.reduce((sum, month) => 
    sum + month.count, 0) / historicalData.length;

  // Get future rental revenue from active tenancies
  const futureRents = await getFutureRentalRevenue(userId);
  
  // Generate predictions for the next 12 months
  const predictions: MonthlyRevenue[] = [];
  const lastMonth = new Date(historicalData[historicalData.length - 1].month);
  
  for (let i = 1; i <= 12; i++) {
    const predictionDate = addMonths(lastMonth, i);
    const monthEnd = endOfMonth(predictionDate);

    // Calculate base predicted revenue from historical trend
    const previousRevenue = i === 1 
      ? historicalData[historicalData.length - 1].revenue 
      : predictions[i - 2].revenue;
    
    let predictedRevenue = previousRevenue * (1 + averageGrowthRate);

    // Add known future rent payments
    const monthlyRents = futureRents.reduce((sum, tenancy) => {
      if (!tenancy.end_date || isBefore(predictionDate, parseISO(tenancy.end_date))) {
        return sum + tenancy.monthly_rent;
      }
      return sum;
    }, 0);

    predictedRevenue += monthlyRents;

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
      revenue: Math.round(predictedRevenue * 100) / 100,
      count: Math.round(averagePayments + propertyBreakdown.length),
      average: predictedRevenue / (averagePayments + propertyBreakdown.length),
      propertyBreakdown
    });
  }

  return predictions;
}