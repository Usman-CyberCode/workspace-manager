"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import {
  requireSessionUser,
  requireWorkspaceAccess,
  WORKSPACE_COOKIE,
} from "@/lib/workspace-context";
import { inviteSchema, workspaceSchema } from "@/lib/validations/workspace";
import { uniqueWorkspaceSlug } from "@/lib/slugify";

export async function createWorkspaceAction(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireSessionUser();
  const parsed = workspaceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const slug = await uniqueWorkspaceSlug(parsed.data.name);
  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      slug,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspace.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  await logActivity({
    type: "WORKSPACE_UPDATED",
    message: `Created workspace "${workspace.name}"`,
    workspaceId: workspace.id,
    userId: user.id,
  });

  revalidatePath("/", "layout");
  return ok({ id: workspace.id });
}

export async function switchWorkspaceAction(workspaceId: string) {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const allowed = ctx.memberships.some((m) => m.workspaceId === workspaceId);
  if (!allowed) {
    return fail("You do not have access to that workspace.");
  }

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/", "layout");
  return ok(undefined);
}

export async function updateWorkspaceAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireWorkspaceAccess("ADMIN");
  const parsed = workspaceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await prisma.workspace.update({
    where: { id: ctx.workspace.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });

  await logActivity({
    type: "WORKSPACE_UPDATED",
    message: `Workspace settings updated`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
  });

  revalidatePath("/settings");
  revalidatePath("/team");
  return ok(undefined);
}

export async function inviteMemberAction(
  _prev: ActionResult<{ token: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ token: string }>> {
  const ctx = await requireWorkspaceAccess("ADMIN");
  const parsed = inviteSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "MEMBER"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const email = parsed.data.email.toLowerCase();
  const existingMember = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: { where: { workspaceId: ctx.workspace.id } },
    },
  });

  if (existingMember?.memberships.length) {
    return fail("This user is already a member of the workspace.");
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.invitation.upsert({
    where: {
      workspaceId_email: {
        workspaceId: ctx.workspace.id,
        email,
      },
    },
    create: {
      email,
      role: parsed.data.role,
      token,
      expiresAt,
      workspaceId: ctx.workspace.id,
      invitedById: ctx.user.id,
    },
    update: {
      role: parsed.data.role,
      token,
      expiresAt,
      invitedById: ctx.user.id,
    },
  });

  await logActivity({
    type: "MEMBER_INVITED",
    message: `Invited ${email} as ${parsed.data.role.toLowerCase()}`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
    metadata: { email },
  });

  revalidatePath("/team");
  return ok({ token });
}

export async function removeMemberAction(memberId: string): Promise<ActionResult> {
  const ctx = await requireWorkspaceAccess("ADMIN");
  const member = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    include: { user: true },
  });

  if (!member || member.workspaceId !== ctx.workspace.id) {
    return fail("Member not found.");
  }

  if (member.role === "OWNER") {
    return fail("Cannot remove the workspace owner.");
  }

  if (member.userId === ctx.user.id) {
    return fail("You cannot remove yourself. Ask another admin.");
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });

  await logActivity({
    type: "MEMBER_REMOVED",
    message: `Removed ${member.user.name ?? member.user.email} from the workspace`,
    workspaceId: ctx.workspace.id,
    userId: ctx.user.id,
  });

  revalidatePath("/team");
  return ok(undefined);
}

export async function acceptInvitationAction(token: string): Promise<ActionResult> {
  const user = await requireSessionUser();
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    return fail("Invitation is invalid or expired.");
  }

  if (invitation.email !== user.email?.toLowerCase()) {
    return fail("This invitation was sent to a different email address.");
  }

  await prisma.$transaction([
    prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: invitation.workspaceId,
        },
      },
      create: {
        userId: user.id,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
      update: { role: invitation.role },
    }),
    prisma.invitation.delete({ where: { id: invitation.id } }),
  ]);

  await logActivity({
    type: "MEMBER_JOINED",
    message: `${user.name ?? user.email} joined via invitation`,
    workspaceId: invitation.workspaceId,
    userId: user.id,
  });

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, invitation.workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/team");
  return ok(undefined);
}
