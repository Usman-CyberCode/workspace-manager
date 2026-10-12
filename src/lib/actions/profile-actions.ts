"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireSessionUser } from "@/lib/workspace-context";

const profileSchema = z.object({
  name: z.string().min(2).max(80),
});

export async function updateProfileAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireSessionUser();
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/settings");
  return ok(undefined);
}
