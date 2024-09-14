'use client';

import { useSearchParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { calculateRetirementPlan, calculateRequiredMonthlySavings, CalculationParams, CalculationResults } from '@/app/lib/calculations';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { AlertCircle, CheckCircle2, InfoIcon } from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

interface ChartDataPoint {
  age: number;
  requiredSavings: number;
  projectedSavings: number;
  fireNumber: number;
}

function generateChartData(
  params: CalculationParams,
  results: CalculationResults
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const monthlyInterestRate = params.investmentReturnRate / 12 / 100;
  const monthlyRequiredSavings = calculateRequiredMonthlySavings(
    params.currentAge,
    params.retirementAge,
    results.fire,
    params.investmentReturnRate
  );

  for (let age = params.currentAge; age <= params.retirementAge; age++) {
    const monthsInvested = (age - params.currentAge + 1) * 12;

    // Calculate required savings using the future value of an annuity formula
    const requiredSavings =
      monthlyRequiredSavings *
      ((Math.pow(1 + monthlyInterestRate, monthsInvested) - 1) / monthlyInterestRate);

    // Calculate projected savings using the future value of an annuity formula
    const projectedSavings =
      params.monthlyInvestment *
      ((Math.pow(1 + monthlyInterestRate, monthsInvested) - 1) / monthlyInterestRate);

    data.push({
      age,
      requiredSavings,
      projectedSavings,
      fireNumber: results.fire,
    });
  }

  return data;
}

export function Charts() {
  const searchParams = useSearchParams();
  const currentAge = parseInt(searchParams.get('currentAge') || '30');
  const retirementAge = parseInt(searchParams.get('retirementAge') || '60');
  const monthlyExpenses = parseInt(searchParams.get('monthlyExpenses') || '50000');
  const monthlyInvestment = parseInt(searchParams.get('monthlyInvestment') || '10000');
  const investmentReturnRate = parseFloat(searchParams.get('investmentReturnRate') || '12');
  const inflationRate = parseFloat(searchParams.get('inflationRate') || '6');

  const params = {
    currentAge,
    retirementAge,
    monthlyExpenses,
    monthlyInvestment,
    investmentReturnRate,
    inflationRate,
  };

  const results = calculateRetirementPlan(params);
  const chartData = generateChartData(params, results);

  const crossoverPoint = chartData.find(point => point.projectedSavings >= results.fire);

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 text-blue-700">
        <InfoIcon className="h-4 w-4 text-blue-500" />
        <AlertTitle className="font-semibold">FIRE Number Explanation</AlertTitle>
        <AlertDescription>
          You would need {formatCurrency(results.fire)} to retire at age {retirementAge}. This is your FIRE (Financial Independence, Retire Early) number, calculated as 25 times your projected annual expenses at retirement.
        </AlertDescription>
      </Alert>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Retirement Projections</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Line type="monotone" dataKey="requiredSavings" name="Required Savings" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="projectedSavings" name="Projected Savings" stroke="#10b981" strokeWidth={2} dot={false} />
            <ReferenceLine y={results.fire} label="FIRE Target" stroke="#ef4444" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
        {crossoverPoint ? (
          <Alert className="mt-4 bg-green-100 border-green-400 text-green-700">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="font-semibold">On Track</AlertTitle>
            <AlertDescription>
              You&apos;re projected to reach your FIRE goal at age {crossoverPoint.age}.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mt-4 bg-red-100 border-red-400 text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle className="font-semibold">Off Track</AlertTitle>
            <AlertDescription>
              With your current investment rate, you may not reach your FIRE goal before retirement.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}