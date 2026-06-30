export interface RentalYieldInput {
  purchasePrice: number;
  monthlyRent: number;
  annualCosts: number;
}

export interface RentalYieldResult {
  grossYield: number;
  netYield: number;
  annualRent: number;
  annualProfit: number;
  monthlyProfit: number;
}

export function calculateRentalYield(
  input: RentalYieldInput
): RentalYieldResult {
  const annualRent = input.monthlyRent * 12;
  const annualProfit = annualRent - input.annualCosts;
  const grossYield = (annualRent / input.purchasePrice) * 100;
  const netYield = (annualProfit / input.purchasePrice) * 100;

  return {
    grossYield,
    netYield,
    annualRent,
    annualProfit,
    monthlyProfit: annualProfit / 12,
  };
}

export interface MortgageInput {
  propertyPrice: number;
  deposit: number;
  annualRate: number;
  termYears: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  totalRepayable: number;
  totalInterest: number;
  ltv: number;
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const loanAmount = input.propertyPrice - input.deposit;
  const monthlyRate = input.annualRate / 100 / 12;
  const numPayments = input.termYears * 12;

  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / numPayments
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalRepayable = monthlyPayment * numPayments;
  const totalInterest = totalRepayable - loanAmount;
  const ltv = (loanAmount / input.propertyPrice) * 100;

  return {
    loanAmount,
    monthlyPayment,
    totalRepayable,
    totalInterest,
    ltv,
  };
}

export interface AreaComparisonInput {
  areaA: { name: string; averagePrice: number; changePercent: number };
  areaB: { name: string; averagePrice: number; changePercent: number };
  monthlyRentA?: number;
  monthlyRentB?: number;
}

export interface AreaComparisonResult {
  priceDifference: number;
  priceDifferencePercent: number;
  changeDifference: number;
  yieldA?: number;
  yieldB?: number;
  recommendation: string;
}

export function compareAreas(
  input: AreaComparisonInput
): AreaComparisonResult {
  const priceDifference =
    input.areaA.averagePrice - input.areaB.averagePrice;
  const priceDifferencePercent =
    (priceDifference / input.areaB.averagePrice) * 100;
  const changeDifference =
    input.areaA.changePercent - input.areaB.changePercent;

  let yieldA: number | undefined;
  let yieldB: number | undefined;

  if (input.monthlyRentA) {
    yieldA = calculateRentalYield({
      purchasePrice: input.areaA.averagePrice,
      monthlyRent: input.monthlyRentA,
      annualCosts: input.areaA.averagePrice * 0.015,
    }).grossYield;
  }
  if (input.monthlyRentB) {
    yieldB = calculateRentalYield({
      purchasePrice: input.areaB.averagePrice,
      monthlyRent: input.monthlyRentB,
      annualCosts: input.areaB.averagePrice * 0.015,
    }).grossYield;
  }

  let recommendation = "";
  if (changeDifference > 1) {
    recommendation = `${input.areaA.name} shows stronger recent growth.`;
  } else if (changeDifference < -1) {
    recommendation = `${input.areaB.name} shows stronger recent growth.`;
  } else {
    recommendation = "Both areas show similar recent price momentum.";
  }

  if (yieldA && yieldB) {
    if (yieldA > yieldB + 0.5) {
      recommendation += ` ${input.areaA.name} offers better gross yield.`;
    } else if (yieldB > yieldA + 0.5) {
      recommendation += ` ${input.areaB.name} offers better gross yield.`;
    }
  }

  return {
    priceDifference,
    priceDifferencePercent,
    changeDifference,
    yieldA,
    yieldB,
    recommendation,
  };
}
