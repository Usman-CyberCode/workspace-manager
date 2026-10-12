import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { WorkspaceRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WORKSPACE_COOKIE = "active-workspace-id";

const roleRank: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function getUserMemberships(userId: string) {
  return prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });
}

export async function getActiveWorkspaceContext() {
  const user = await requireSessionUser();
  const memberships = await getUserMemberships(user.id);

  if (memberships.length === 0) {
    return { user, membership: null, workspace: null, memberships };
  }

  const cookieStore = await cookies();
  const cookieId = cookieStore.get(WORKSPACE_COOKIE)?.value;
  const membership =
    memberships.find((m) => m.workspaceId === cookieId) ?? memberships[0];

  return {
    user,
    membership,
    workspace: membership.workspace,
    memberships,
  };
}

export async function requireWorkspaceAccess(minRole: WorkspaceRole = "MEMBER") {
  const ctx = await getActiveWorkspaceContext();
  if (!ctx.membership || !ctx.workspace) {
    redirect("/settings?onboarding=workspace");
  }

  if (roleRank[ctx.membership.role] < roleRank[minRole]) {
    redirect("/dashboard?error=insufficient-permissions");
  }

  return ctx as typeof ctx & {
    membership: NonNullable<(typeof ctx)["membership"]>;
    workspace: NonNullable<(typeof ctx)["workspace"]>;
  };
}

export async function assertProjectInWorkspace(
  projectId: string,
  workspaceId: string,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId },
  });
  if (!project) {
    throw new Error("Project not found in this workspace.");
  }
  return project;
}

export async function assertMemberInWorkspace(
  userId: string,
  workspaceId: string,
) {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
  });
  if (!member) {
    throw new Error("User is not a member of this workspace.");
  }
  return member;
}

export { WORKSPACE_COOKIE };
