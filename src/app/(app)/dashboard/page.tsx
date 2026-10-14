import Link from "next/link";
import { ArrowUpRight, CalendarClock, CheckCircle2, FolderKanban } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatRelative, dueDateLabel } from "@/lib/format";
import { requireWorkspaceAccess } from "@/lib/workspace-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await requireWorkspaceAccess("MEMBER");
  const workspaceId = ctx.workspace.id;

  const [projectCount, tasks, recentActivity, upcomingTasks] = await Promise.all([
    prisma.project.count({ where: { workspaceId } }),
    prisma.task.findMany({
      where: { project: { workspaceId } },
      select: { status: true },
    }),
    prisma.activity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.task.findMany({
      where: {
        project: { workspaceId },
        status: { not: "DONE" },
        dueDate: { not: null },
      },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: { project: { select: { name: true } } },
    }),
  ]);

  const done = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter((t) => t.status === "TODO").length;

  return (
    <>
      <DashboardHeader
        title={`Welcome back${ctx.user.name ? `, ${ctx.user.name.split(" ")[0]}` : ""}`}
        description={`Here's what's happening in ${ctx.workspace.name}.`}
        breadcrumbs={["Workspace", "Dashboard"]}
        userName={ctx.user.name ?? ctx.user.email}
      />
      <div className="space-y-6 p-4 sm:p-6">
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Projects",
              value: projectCount,
              icon: FolderKanban,
              href: "/projects",
            },
            {
              label: "Tasks completed",
              value: done,
              icon: CheckCircle2,
              href: "/tasks",
            },
            {
              label: "In progress",
              value: inProgress,
              icon: ArrowUpRight,
              href: "/tasks",
            },
            {
              label: "Pending",
              value: todo,
              icon: CalendarClock,
              href: "/tasks",
            },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <Card className="surface-glass">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                  <Link
                    href={stat.href}
                    className="mt-2 inline-flex text-xs text-primary hover:underline"
                  >
                    View details
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Card className="surface-glass h-full">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest updates across your workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activity yet. Create a project or task to get started.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {recentActivity.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm">{item.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.user?.name ?? item.user?.email ?? "System"} ·{" "}
                            {formatRelative(item.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.05}>
            <Card className="surface-glass h-full">
              <CardHeader>
                <CardTitle>Upcoming deadlines</CardTitle>
                <CardDescription>Open tasks sorted by due date.</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No upcoming due dates. Add due dates to tasks to see them here.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/30 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.project.name}
                          </p>
                        </div>
                        <Badge variant="warning">{dueDateLabel(task.dueDate)}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.08}>
          <Card className="surface-glass">
            <CardHeader>
              <CardTitle>Completion overview</CardTitle>
              <CardDescription>
                {done} completed · {inProgress} in progress · {todo} pending ·{" "}
                {formatDate(new Date())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-emerald-500/80"
                  style={{
                    width: tasks.length ? `${(done / tasks.length) * 100}%` : "0%",
                  }}
                />
                <div
                  className="bg-primary/80"
                  style={{
                    width: tasks.length
                      ? `${(inProgress / tasks.length) * 100}%`
                      : "0%",
                  }}
                />
                <div
                  className="bg-muted-foreground/40"
                  style={{
                    width: tasks.length ? `${(todo / tasks.length) * 100}%` : "0%",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}