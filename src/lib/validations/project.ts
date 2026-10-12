import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum([
    "PLANNING",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
    "ARCHIVED",
  ]),
  deadline: z.string().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;
