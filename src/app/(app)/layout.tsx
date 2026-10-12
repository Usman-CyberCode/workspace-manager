import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getActiveWorkspaceContext } from "@/lib/workspace-context";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getActiveWorkspaceContext();

  if (!ctx.membership || !ctx.workspace) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const workspaces = ctx.memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        workspaces={workspaces}
        activeWorkspaceId={ctx.workspace.id}
      />
      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
