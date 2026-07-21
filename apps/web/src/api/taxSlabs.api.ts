import { apiClient } from "./client";
import { type ApiSuccessResponse, unwrapApiResponse } from "./responses";

export type TaxSlab = {
  minIncome: number;
  maxIncome: number | null;
  taxRatePercent: number;
};

export type TaxSlabsRequest = {
  country: "IN";
  regime: "NEW";
  assessmentYear: "2026-27";
  amount?: number;
};

export type TaxSlabsResponse = {
  country: "IN";
  currency: "INR";
  regime: "NEW";
  assessmentYear: "2026-27";
  slabs: TaxSlab[];
  calculation?: {
    taxableIncome: number;
    taxAmount: number;
  };
};

export async function getTaxSlabs(params: TaxSlabsRequest, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccessResponse<TaxSlabsResponse>>(
    "/tax-slabs",
    {
      signal,
      params
    }
  );

  return unwrapApiResponse(response.data);
}
