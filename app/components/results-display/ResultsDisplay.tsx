'use client';

import { useSearchParams } from 'next/navigation';
import { calculateRetirementPlan, calculateRequiredMonthlySavings } from '@/app/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { InfoIcon } from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function ResultsDisplay() {
  const searchParams = useSearchParams();
  const currentAge = parseInt(searchParams.get('currentAge') || '30');
  const retirementAge = parseInt(searchParams.get('retirementAge') || '60');
  const monthlyExpenses = parseInt(searchParams.get('monthlyExpenses') || '50000');
  const monthlyInvestment = parseInt(searchParams.get('monthlyInvestment') || '10000');
  const investmentReturnRate = parseFloat(searchParams.get('investmentReturnRate') || '12');
  const inflationRate = parseFloat(searchParams.get('inflationRate') || '6');

  const results = calculateRetirementPlan({
    currentAge,
    retirementAge,
    monthlyExpenses,
    monthlyInvestment,
    investmentReturnRate,
    inflationRate,
  });

  const requiredMonthlySavings = calculateRequiredMonthlySavings(
    currentAge,
    retirementAge,
    results.fire,
    investmentReturnRate
  );

  const progressPercentage = (monthlyInvestment / requiredMonthlySavings) * 100;

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 text-blue-700">
        <InfoIcon className="h-4 w-4 text-blue-500" />
        <AlertTitle className="font-semibold">FIRE Number Explanation</AlertTitle>
        <AlertDescription>
          You would need {formatCurrency(results.fire)} to retire at age {retirementAge}. This is your FIRE (Financial Independence, Retire Early) number, calculated as 25 times your projected annual expenses at retirement.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-700">FIRE Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Lean FIRE</p>
              <p className="text-2xl font-bold">{formatCurrency(results.leanFIRE)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">FIRE</p>
              <p className="text-2xl font-bold">{formatCurrency(results.fire)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fat FIRE</p>
              <p className="text-2xl font-bold">{formatCurrency(results.fatFIRE)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="text-green-700">Savings Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Required Monthly Investment</p>
              <p className="text-2xl font-bold">{formatCurrency(requiredMonthlySavings)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Your Current Monthly Investment</p>
              <p className="text-2xl font-bold">{formatCurrency(monthlyInvestment)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-sm text-gray-500 mt-1">{progressPercentage.toFixed(1)}% of target</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-700">SIP Returns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Future Value</p>
              <p className="text-2xl font-bold">{formatCurrency(results.sipReturns.futureValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Investment</p>
              <p className="text-2xl font-bold">{formatCurrency(results.sipReturns.totalInvestment)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Returns</p>
              <p className="text-2xl font-bold">{formatCurrency(results.sipReturns.totalReturns)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IRR</p>
              <p className="text-2xl font-bold">{results.sipReturns.irr.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}