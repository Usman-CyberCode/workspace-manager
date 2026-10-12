import { DashboardHeader } from "@/components/layout/dashboard-header";
import { InviteMemberForm } from "@/components/team/invite-member-form";
import { RemoveMemberButton } from "@/components/team/member-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireWorkspaceAccess } from "@/lib/workspace-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const canManage = ctx.membership.role === "OWNER" || ctx.membership.role === "ADMIN";

  const [members, invitations] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: ctx.workspace.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: [{ role: "desc" }, { joinedAt: "asc" }],
    }),
    canManage
      ? prisma.invitation.findMany({
          where: { workspaceId: ctx.workspace.id, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <DashboardHeader
        title="Team"
        description="Manage workspace members, roles, and invitations."
        breadcrumbs={["Workspace", "Team"]}
        userName={ctx.user.name ?? ctx.user.email}
      />
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length === 1 ? "" : "s"} in{" "}
              {ctx.workspace.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {member.user.name ?? member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{member.role.toLowerCase()}</Badge>
                    {canManage && member.role !== "OWNER" ? (
                      <RemoveMemberButton
                        memberId={member.id}
                        memberName={member.user.name ?? member.user.email}
                      />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {canManage ? (
          <>
            <Card className="surface-glass">
              <CardHeader>
                <CardTitle>Invite teammate</CardTitle>
                <CardDescription>
                  Generate a secure invitation link for a new member or admin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteMemberForm />
              </CardContent>
            </Card>

            <Card className="surface-glass">
              <CardHeader>
                <CardTitle>Pending invitations</CardTitle>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No pending invitations.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {invitations.map((invite) => (
                      <li
                        key={invite.id}
                        className="rounded-lg border border-border/60 px-3 py-2"
                      >
                        {invite.email} · {invite.role.toLowerCase()} · expires{" "}
                        {invite.expiresAt.toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </>
  );
}
