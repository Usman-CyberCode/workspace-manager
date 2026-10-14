import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { projectStatusLabels, taskStatusLabels } from "@/lib/labels";
import { requireWorkspaceAccess } from "@/lib/workspace-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireWorkspaceAccess("MEMBER");

  const project = await prisma.project.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      tasks: {
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        include: {
          assignee: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <>
      <DashboardHeader
        title={project.name}
        description={project.description ?? "Project details and task breakdown."}
        breadcrumbs={["Workspace", "Projects", project.name]}
        userName={ctx.user.name ?? ctx.user.email}
      />
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="surface-glass">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Deadline {formatDate(project.deadline)}
              </CardDescription>
            </div>
            <Badge>{projectStatusLabels[project.status]}</Badge>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm">
            <Link href="/tasks" className="text-primary hover:underline">
              Open task board
            </Link>
            <Link href="/projects" className="text-muted-foreground hover:underline">
              Back to projects
            </Link>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>Tasks ({project.tasks.length})</CardTitle>
            <CardDescription>Tasks associated with this project.</CardDescription>
          </CardHeader>
          <CardContent>
            {project.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks yet. Create one from the Tasks page.
              </p>
            ) : (
              <ul className="space-y-3">
                {project.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.assignee?.name ?? task.assignee?.email ?? "Unassigned"} ·{" "}
                        Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {taskStatusLabels[task.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
