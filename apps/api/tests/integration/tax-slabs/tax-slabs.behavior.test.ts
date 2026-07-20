import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { createApp } from "../../../src/app.js";
import { signJwt } from "../../../src/shared/auth/jwt.js";

const organizationId = "seed-org-acme";
const authToken = signJwt({
  id: "test-hr-manager",
  email: "hr.manager@acme.example",
  role: "HR_MANAGER",
  organizationId
});

function authorizationHeader() {
  return {
    authorization: `Bearer ${authToken}`
  };
}

type TaxSlabResponse = {
  country: "IN";
  currency: "INR";
  regime: "NEW";
  assessmentYear: string;
  slabs: Array<{
    minIncome: number;
    maxIncome: number | null;
    taxRatePercent: number;
  }>;
  calculation?: {
    taxableIncome: number;
    taxAmount: number;
  };
};

type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

describe("tax slabs behavior", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("returns India new-regime tax slabs for AY 2026-27", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/tax-slabs?country=IN&regime=NEW&assessmentYear=2026-27",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<TaxSlabResponse>>();

    expect(body).toMatchObject({
      success: true,
      message: "Request completed successfully",
      data: {
        country: "IN",
        currency: "INR",
        regime: "NEW",
        assessmentYear: "2026-27"
      }
    });
    expect(body.data.slabs).toEqual([
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
    ]);
  });

  it("calculates India new-regime slab tax for an input amount", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/tax-slabs?country=IN&regime=NEW&assessmentYear=2026-27&amount=1800000",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<TaxSlabResponse>>();

    expect(body.data.calculation).toEqual({
      taxableIncome: 1_800_000,
      taxAmount: 160_000
    });
  });
});
