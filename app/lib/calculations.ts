interface CalculationParams {
    currentAge: number;
    retirementAge: number;
    monthlyExpenses: number;
    monthlyInvestment: number;
    investmentReturnRate: number; // Expected annual rate of return (%)
    inflationRate: number;        // Expected annual inflation rate (%)
  }
  
  interface CalculationResults {
    currentAnnualExpenses: number;
    futureAnnualExpenses: number;
    leanFIRE: number;
    fire: number;
    fatFIRE: number;
    monthlySavingsRequired: number;
    sipReturns: {
      futureValue: number;
      totalInvestment: number;
      totalReturns: number;
      irr: number; // Updated from cagr to irr
      absoluteReturn: number;
    };
    inflationRate: number;
  }
  
  export function calculateRetirementPlan(params: CalculationParams): CalculationResults {
    const {
      currentAge,
      retirementAge,
      monthlyExpenses,
      monthlyInvestment,
      investmentReturnRate,
      inflationRate,
    } = params;
  
    const yearsToRetirement = retirementAge - currentAge;
    const totalMonths = yearsToRetirement * 12;
    const currentAnnualExpenses = monthlyExpenses * 12;
    const futureAnnualExpenses =
      currentAnnualExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  
    const leanFIRE = futureAnnualExpenses * 20;
    const fire = futureAnnualExpenses * 25;
    const fatFIRE = futureAnnualExpenses * 50;
  
    const monthlyInterestRate = investmentReturnRate / (12 * 100);
  
    // Use the annuity due formula for contributions at the beginning of each period
    const annuityFactor = ((Math.pow(1 + monthlyInterestRate, totalMonths) - 1) / monthlyInterestRate) * (1 + monthlyInterestRate);
    const monthlySavingsRequired = (fire / annuityFactor) * 1.2; // Apply 20% buffer if necessary
  
    const futureValue = monthlyInvestment * annuityFactor;
    const totalInvestment = monthlyInvestment * totalMonths;
    const totalReturns = futureValue - totalInvestment;
  
    // Implement IRR calculation for SIP
    const irr = calculateIRR(monthlyInvestment, futureValue, totalMonths);
  
    const absoluteReturn = (totalReturns / totalInvestment) * 100;
  
    return {
      currentAnnualExpenses,
      futureAnnualExpenses,
      leanFIRE,
      fire,
      fatFIRE,
      monthlySavingsRequired,
      sipReturns: {
        futureValue,
        totalInvestment,
        totalReturns,
        irr,
        absoluteReturn,
      },
      inflationRate,
    };
  }
  
// Function to calculate IRR for SIP investments
function calculateIRR(
    monthlyInvestment: number,
    futureValue: number,
    totalMonths: number
  ): number {
    // Define the cash flows array
    const cashFlows: number[] = [];
  
    // Monthly investments are outflows (negative cash flows)
    for (let i = 0; i < totalMonths; i++) {
      cashFlows.push(-monthlyInvestment);
    }
  
    // Add the future value as the final inflow (positive cash flow)
    cashFlows.push(futureValue);
  
    // Initial guesses for the IRR
    let lowerRate = 0.0;
    let upperRate = 1.0; // 100% per period, an arbitrary upper bound
  
    // Tolerance and maximum iterations for the iterative method
    const tol = 1e-6;
    const maxIterations = 1000;
    let irr = 0.0;
  
    // Bisection method to find the IRR
    for (let i = 0; i < maxIterations; i++) {
      irr = (lowerRate + upperRate) / 2;
      const npv = calculateNPV(irr, cashFlows);
  
      if (Math.abs(npv) < tol) {
        break; // Found the IRR within the desired tolerance
      }
  
      // Adjust the bounds based on the NPV
      if (npv > 0) {
        lowerRate = irr;
      } else {
        upperRate = irr;
      }
    }
  
    // Convert the periodic IRR to annual IRR
    const monthlyIRR = irr;
    const annualIRR = Math.pow(1 + monthlyIRR, 12) - 1;
  
    return annualIRR * 100; // Return IRR as a percentage
  }
  
  // Helper function to calculate NPV for a given rate and cash flows
  function calculateNPV(rate: number, cashFlows: number[]): number {
    let npv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return npv;
  }
  
  
  export function calculateRequiredMonthlySavings(
    currentAge: number,
    retirementAge: number,
    fireNumber: number,
    investmentReturnRate: number
  ): number {
    const totalMonths = (retirementAge - currentAge) * 12;
    const monthlyInterestRate = investmentReturnRate / (12 * 100);
  
    // Use the same annuity formula as in calculateRetirementPlan
    const annuityFactor = ((Math.pow(1 + monthlyInterestRate, totalMonths) - 1) / monthlyInterestRate) * (1 + monthlyInterestRate);
  
    return fireNumber / annuityFactor;
  }
  