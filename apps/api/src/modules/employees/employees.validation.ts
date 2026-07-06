import { z } from "zod";

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
