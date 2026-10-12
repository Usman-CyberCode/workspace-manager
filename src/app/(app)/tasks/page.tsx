import { DashboardHeader } from "@/components/layout/dashboard-header";
import { TasksBoard } from "@/components/tasks/tasks-board";
import { requireWorkspaceAccess } from "@/lib/workspace-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const ctx = await requireWorkspaceAccess("MEMBER");

  const [tasks, projects, members] = await Promise.all([
    prisma.task.findMany({
      where: { project: { workspaceId: ctx.workspace.id } },
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.project.findMany({
      where: { workspaceId: ctx.workspace.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: {
        memberships: { some: { workspaceId: ctx.workspace.id } },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <DashboardHeader
        title="Tasks"
        description="Kanban-style board with search, filters, and accessible status controls."
        breadcrumbs={["Workspace", "Tasks"]}
        userName={ctx.user.name ?? ctx.user.email}
      />
      <div className="p-4 sm:p-6">
        <TasksBoard tasks={tasks} projects={projects} members={members} />
      </div>
    </>
  );
}
