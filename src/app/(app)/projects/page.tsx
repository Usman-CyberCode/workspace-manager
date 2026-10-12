import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectsView } from "@/components/projects/projects-view";
import { requireWorkspaceAccess } from "@/lib/workspace-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const ctx = await requireWorkspaceAccess("MEMBER");

  const projects = await prisma.project.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <>
      <DashboardHeader
        title="Projects"
        description="Organize initiatives, timelines, and delivery status."
        breadcrumbs={["Workspace", "Projects"]}
        userName={ctx.user.name ?? ctx.user.email}
      />
      <div className="p-4 sm:p-6">
        <ProjectsView projects={projects} />
      </div>
    </>
  );
}
