export type TaxCountry = "IN";
export type TaxRegime = "NEW";

export type TaxSlab = {
  minIncome: number;
  maxIncome: number | null;
  taxRatePercent: number;
};

export type GetTaxSlabsInput = {
  country: TaxCountry;
  regime: TaxRegime;
  assessmentYear: "2026-27";
  amount?: number;
};

const indiaNewRegimeSlabs: TaxSlab[] = [
  {
    minIncome: 0,
    maxIncome: 400_000,
    taxRatePercent: 0
  },
  {
    minIncome: 400_001,
    maxIncome: 800_000,
    taxRatePercent: 5
  },
  {
    minIncome: 800_001,
    maxIncome: 1_200_000,
    taxRatePercent: 10
  },
  {
    minIncome: 1_200_001,
    maxIncome: 1_600_000,
    taxRatePercent: 15
  },
  {
    minIncome: 1_600_001,
    maxIncome: 2_000_000,
    taxRatePercent: 20
  },
  {
    minIncome: 2_000_001,
    maxIncome: 2_400_000,
    taxRatePercent: 25
  },
  {
    minIncome: 2_400_001,
    maxIncome: null,
    taxRatePercent: 30
  }
];

export function getTaxSlabs(input: GetTaxSlabsInput) {
  const calculation =
    input.amount === undefined
      ? undefined
      : {
          taxableIncome: input.amount,
          taxAmount: calculateProgressiveTax(input.amount, indiaNewRegimeSlabs)
        };

  return {
    country: input.country,
    currency: "INR" as const,
    regime: input.regime,
    assessmentYear: input.assessmentYear,
    slabs: indiaNewRegimeSlabs,
    calculation
  };
}

function calculateProgressiveTax(amount: number, slabs: TaxSlab[]) {
  let previousMaxIncome = 0;

  const taxAmount = slabs.reduce((total, slab) => {
    if (amount <= previousMaxIncome) {
      return total;
    }

    const slabMaxIncome = slab.maxIncome ?? amount;
    const taxableAmountInSlab = Math.min(amount, slabMaxIncome) - previousMaxIncome;

    previousMaxIncome = slabMaxIncome;

    return total + Math.max(taxableAmountInSlab, 0) * (slab.taxRatePercent / 100);
  }, 0);

  return Math.round(taxAmount * 100) / 100;
}
