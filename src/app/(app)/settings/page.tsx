import { DashboardHeader } from "@/components/layout/dashboard-header";
import { AcceptInviteButton } from "@/components/settings/accept-invite";
import {
  CreateWorkspaceForm,
  ProfileSettingsForm,
  WorkspaceSettingsForm,
} from "@/components/settings/settings-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getActiveWorkspaceContext, requireSessionUser } from "@/lib/workspace-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string; invite?: string }>;
}) {
  const user = await requireSessionUser();
  const params = await searchParams;
  const ctx = await getActiveWorkspaceContext();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true },
  });

  const onboarding = params.onboarding === "workspace" || !ctx.workspace;
  const canEditWorkspace =
    ctx.membership?.role === "OWNER" || ctx.membership?.role === "ADMIN";

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Profile, workspace preferences, and theme."
        breadcrumbs={["Workspace", "Settings"]}
        userName={user.name ?? user.email}
      />
      <div className="space-y-6 p-4 sm:p-6">
        {params.invite ? <AcceptInviteButton token={params.invite} /> : null}

        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>{dbUser?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm name={dbUser?.name ?? ""} />
          </CardContent>
        </Card>

        {onboarding ? (
          <Card className="surface-glass">
            <CardHeader>
              <CardTitle>Create a workspace</CardTitle>
              <CardDescription>
                You need a workspace before using the dashboard navigation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateWorkspaceForm />
            </CardContent>
          </Card>
        ) : (
          <Card className="surface-glass">
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                {canEditWorkspace
                  ? "Update workspace details for all members."
                  : "Only admins and owners can edit workspace settings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceSettingsForm
                name={ctx.workspace!.name}
                description={ctx.workspace!.description}
                canEdit={Boolean(canEditWorkspace)}
              />
            </CardContent>
          </Card>
        )}

        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Nexus Workspace uses a refined dark theme by default for focus and
              contrast. Light theme support can be added in a future iteration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Current theme: <span className="text-foreground">Dark (default)</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
