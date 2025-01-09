import { MonthlyRevenue } from "../types/revenue";
import { addMonths, format } from "date-fns";
import { formatMonthDisplay } from "./dateUtils";

export function calculatePredictedRevenue(historicalData: MonthlyRevenue[]): MonthlyRevenue[] {
  if (historicalData.length < 2) return [];

  // Calculate average month-over-month growth
  let totalGrowth = 0;
  for (let i = 1; i < historicalData.length; i++) {
    const currentRevenue = historicalData[i].revenue;
    const previousRevenue = historicalData[i - 1].revenue;
    if (previousRevenue > 0) {
      totalGrowth += (currentRevenue - previousRevenue) / previousRevenue;
    }
  }
  
  const averageGrowthRate = totalGrowth / (historicalData.length - 1);
  
  // Calculate average number of payments per month
  const averagePayments = historicalData.reduce((sum, month) => 
    sum + month.count, 0) / historicalData.length;

  // Generate predictions for the next 3 months
  const predictions: MonthlyRevenue[] = [];
  const lastMonth = new Date(historicalData[historicalData.length - 1].month);
  
  for (let i = 1; i <= 3; i++) {
    const predictionDate = addMonths(lastMonth, i);
    const previousRevenue = i === 1 
      ? historicalData[historicalData.length - 1].revenue 
      : predictions[i - 2].revenue;
    
    const predictedRevenue = previousRevenue * (1 + averageGrowthRate);
    
    predictions.push({
      month: formatMonthDisplay(format(predictionDate, 'yyyy-MM-dd')),
      revenue: Math.round(predictedRevenue * 100) / 100,
      count: Math.round(averagePayments),
      average: predictedRevenue / averagePayments,
      isPrediction: true
    });
  }

  return predictions;
}