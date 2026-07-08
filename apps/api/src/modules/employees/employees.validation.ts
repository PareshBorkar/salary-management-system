import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional()
);

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email().optional()
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.date().optional()
);

export const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  level: z.string().trim().min(1).optional(),
  sortBy: z
    .enum([
      "employeeCode",
      "firstName",
      "lastName",
      "country",
      "department",
      "role",
      "level",
      "salary"
    ])
    .default("employeeCode"),
  sortDirection: z.enum(["asc", "desc"]).default("asc")
});

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: optionalEmail,
  title: optionalTrimmedString,
  department: optionalTrimmedString,
  country: optionalTrimmedString,
  role: optionalTrimmedString,
  level: optionalTrimmedString,
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).default("ACTIVE"),
  hiredAt: optionalDate
});
