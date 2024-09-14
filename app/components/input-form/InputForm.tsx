'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryState } from 'nuqs';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { Slider } from '@/app/components/ui/slider';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import debounce from 'lodash/debounce';

interface FormData {
  currentAge: number;
  retirementAge: number;
  monthlyExpenses: number;
  monthlyInvestment: number;
  investmentReturnRate: number;
  inflationRate: number;
}

const initialFormData: FormData = {
  currentAge: 30,
  retirementAge: 60,
  monthlyExpenses: 50000,
  monthlyInvestment: 10000,
  investmentReturnRate: 12,
  inflationRate: 6,
};

interface Scenario {
  name: string;
  data: FormData;
}

export function InputForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [, setCurrentAge] = useQueryState('currentAge');
  const [, setRetirementAge] = useQueryState('retirementAge');
  const [, setMonthlyExpenses] = useQueryState('monthlyExpenses');
  const [, setMonthlyInvestment] = useQueryState('monthlyInvestment');
  const [, setInvestmentReturnRate] = useQueryState('investmentReturnRate');
  const [, setInflationRate] = useQueryState('inflationRate');

  useEffect(() => {
    // Load scenarios from local storage on component mount
    const storedScenarios = localStorage.getItem('retirementScenarios');
    if (storedScenarios) {
      setScenarios(JSON.parse(storedScenarios));
    }
  }, []);

  const debouncedUpdateQueryParams = useCallback(
    debounce((data: FormData) => {
      if (validateForm(data)) {
        updateQueryParams(data);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    debouncedUpdateQueryParams(formData);
  }, [formData, debouncedUpdateQueryParams]);

  function validateForm(data: FormData): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (data.currentAge >= data.retirementAge) {
      newErrors.retirementAge = "Must be greater than current age";
    }
    if (data.monthlyExpenses <= 0) {
      newErrors.monthlyExpenses = "Must be greater than 0";
    }
    if (data.monthlyInvestment < 0) {
      newErrors.monthlyInvestment = "Cannot be negative";
    }
    if (data.investmentReturnRate <= 0) {
      newErrors.investmentReturnRate = "Must be greater than 0";
    }
    if (data.inflationRate < 0) {
      newErrors.inflationRate = "Cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function updateQueryParams(data: FormData) {
    setCurrentAge(data.currentAge.toString());
    setRetirementAge(data.retirementAge.toString());
    setMonthlyExpenses(data.monthlyExpenses.toString());
    setMonthlyInvestment(data.monthlyInvestment.toString());
    setInvestmentReturnRate(data.investmentReturnRate.toString());
    setInflationRate(data.inflationRate.toString());
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
  }

  function handleSliderChange(name: keyof FormData, value: number[]) {
    setFormData((prev) => ({ ...prev, [name]: value[0] }));
  }

  function handleSaveScenario() {
    if (scenarioName && validateForm(formData)) {
      const newScenarios = [...scenarios, { name: scenarioName, data: formData }];
      setScenarios(newScenarios);
      localStorage.setItem('retirementScenarios', JSON.stringify(newScenarios));
      setScenarioName('');
    }
  }

  function handleLoadScenario(data: FormData) {
    setFormData(data);
  }

  function handleDeleteScenario(index: number) {
    const newScenarios = scenarios.filter((_, i) => i !== index);
    setScenarios(newScenarios);
    localStorage.setItem('retirementScenarios', JSON.stringify(newScenarios));
  }

  return (
    <form className="space-y-6">
      <div className="space-y-4">
        <TooltipProvider>
          {[
            { label: 'Current Age', name: 'currentAge', tooltip: 'Your current age in years', min: 18, max: 80, color: 'blue' },
            { label: 'Retirement Age', name: 'retirementAge', tooltip: 'The age at which you plan to retire', min: 40, max: 90, color: 'purple' },
            { label: 'Monthly Expenses (₹)', name: 'monthlyExpenses', tooltip: 'Your average monthly expenses in Rupees', min: 10000, max: 500000, color: 'green' },
            { label: 'Monthly Investment (₹)', name: 'monthlyInvestment', tooltip: 'Amount you can invest monthly in Rupees', min: 1000, max: 200000, color: 'yellow' },
            { label: 'Investment Return Rate (%)', name: 'investmentReturnRate', tooltip: 'Expected annual return on investments', min: 1, max: 20, color: 'orange' },
            { label: 'Inflation Rate (%)', name: 'inflationRate', tooltip: 'Expected annual inflation rate', min: 1, max: 10, color: 'red' },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className={`flex items-center text-sm font-medium text-${field.color}-600`}>
                {field.label}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoCircledIcon className={`h-4 w-4 ml-2 text-${field.color}-400`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id={field.name}
                  min={field.min}
                  max={field.max}
                  step={field.name.includes('Rate') ? 0.1 : 1}
                  value={[formData[field.name as keyof FormData]]}
                  onValueChange={(value) => handleSliderChange(field.name as keyof FormData, value)}
                  className={`flex-grow bg-${field.color}-200`}
                />
                <Input
                  type="number"
                  id={`${field.name}-input`}
                  name={field.name}
                  value={formData[field.name as keyof FormData]}
                  onChange={handleInputChange}
                  className={`w-24 border-${field.color}-300 focus:ring-${field.color}-500`}
                />
              </div>
              {errors[field.name as keyof FormData] && (
                <Alert variant="destructive">
                  <AlertDescription>{errors[field.name as keyof FormData]}</AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </TooltipProvider>
      </div>
      <div className="flex flex-col space-y-4">
        <Input
          type="text"
          placeholder="Scenario Name"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className="border-purple-300 focus:ring-purple-500"
        />
        <Button type="button" onClick={handleSaveScenario} variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          Save Scenario
        </Button>
      </div>
      {scenarios.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Saved Scenarios</Label>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm" 
                  onClick={() => handleLoadScenario(scenario.data)}
                  className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                >
                  {scenario.name}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteScenario(index)}
                  className="text-red-500 hover:bg-red-100"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}