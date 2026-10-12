"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import {
  assertProjectInWorkspace,
  requireWorkspaceAccess,
} from "@/lib/workspace-context";
import { projectSchema } from "@/lib/validations/project";

function parseDeadline(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createProjectAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const parsed = projectSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "PLANNING"),
    deadline: String(formData.get("deadline") ?? ""),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      status: parsed.data.status,
      deadline: parseDeadline(parsed.data.deadline),
      workspaceId: ctx.workspace.id,
    },
  });

  await logActivity({
    type: "PROJECT_CREATED",
    message: `Created project "${project.name}"`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    projectId: project.id,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return ok({ id: project.id });
}

export async function updateProjectAction(
  projectId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireWorkspaceAccess("MEMBER");
  await assertProjectInWorkspace(projectId, ctx.workspace.id);

  const parsed = projectSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "PLANNING"),
    deadline: String(formData.get("deadline") ?? ""),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      status: parsed.data.status,
      deadline: parseDeadline(parsed.data.deadline),
    },
  });

  await logActivity({
    type: "PROJECT_UPDATED",
    message: `Updated project "${project.name}"`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    projectId: project.id,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return ok(undefined);
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const project = await assertProjectInWorkspace(projectId, ctx.workspace.id);

  await prisma.project.delete({ where: { id: projectId } });

  await logActivity({
    type: "PROJECT_DELETED",
    message: `Deleted project "${project.name}"`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    projectId: project.id,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return ok(undefined);
}
