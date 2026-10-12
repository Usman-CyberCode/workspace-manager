"use server";

import { revalidatePath } from "next/cache";
import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import {
  assertMemberInWorkspace,
  assertProjectInWorkspace,
  requireWorkspaceAccess,
} from "@/lib/workspace-context";
import { taskSchema } from "@/lib/validations/task";

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getTaskInWorkspace(taskId: string, workspaceId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { workspaceId } },
    include: { project: true },
  });
  if (!task) {
    throw new Error("Task not found.");
  }
  return task;
}

export async function createTaskAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const parsed = taskSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "TODO"),
    priority: String(formData.get("priority") ?? "MEDIUM"),
    projectId: String(formData.get("projectId") ?? ""),
    assigneeId: String(formData.get("assigneeId") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await assertProjectInWorkspace(parsed.data.projectId, ctx.workspace.id);

  const assigneeId = parsed.data.assigneeId || null;
  if (assigneeId) {
    await assertMemberInWorkspace(assigneeId, ctx.workspace.id);
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      projectId: parsed.data.projectId,
      assigneeId,
      dueDate: parseDate(parsed.data.dueDate),
    },
  });

  await logActivity({
    type: "TASK_CREATED",
    message: `Created task "${task.title}"`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${task.projectId}`);
  return ok({ id: task.id });
}

export async function updateTaskAction(
  taskId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const existing = await getTaskInWorkspace(taskId, ctx.workspace.id);

  const parsed = taskSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "TODO"),
    priority: String(formData.get("priority") ?? "MEDIUM"),
    projectId: String(formData.get("projectId") ?? existing.projectId),
    assigneeId: String(formData.get("assigneeId") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await assertProjectInWorkspace(parsed.data.projectId, ctx.workspace.id);
  const assigneeId = parsed.data.assigneeId || null;
  if (assigneeId) {
    await assertMemberInWorkspace(assigneeId, ctx.workspace.id);
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      projectId: parsed.data.projectId,
      assigneeId,
      dueDate: parseDate(parsed.data.dueDate),
    },
  });

  await logActivity({
    type: "TASK_UPDATED",
    message: `Updated task "${task.title}"`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${task.projectId}`);
  return ok(undefined);
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<ActionResult> {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const existing = await getTaskInWorkspace(taskId, ctx.workspace.id);

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  await logActivity({
    type: "TASK_UPDATED",
    message: `Moved "${task.title}" to ${status.replace("_", " ").toLowerCase()}`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    projectId: existing.projectId,
    taskId: task.id,
    metadata: { status },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return ok(undefined);
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const task = await getTaskInWorkspace(taskId, ctx.workspace.id);

  await prisma.task.delete({ where: { id: taskId } });

  await logActivity({
    type: "TASK_DELETED",
    message: `Deleted task "${task.title}"`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    projectId: task.projectId,
    taskId: task.id,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${task.projectId}`);
  return ok(undefined);
}
