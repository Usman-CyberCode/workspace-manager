import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
