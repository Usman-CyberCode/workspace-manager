"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import {
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/lib/actions/task-actions";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dueDateLabel, formatDate } from "@/lib/format";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/labels";

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  dueDate: Date | null;
  project: { name: string };
  assignee: { id: string; name: string | null; email: string } | null;
};

const columns: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TasksBoard({
  tasks,
  projects,
  members,
}: {
  tasks: TaskItem[];
  projects: { id: string; name: string }[];
  members: { id: string; name: string | null; email: string }[];
}) {
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesProject =
        projectFilter === "ALL" || task.projectId === projectFilter;
      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;
      return matchesQuery && matchesProject && matchesPriority;
    });
  }, [tasks, query, projectFilter, priorityFilter]);

  function moveTask(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Task status updated");
    });
  }

  function removeTask(id: string, title: string) {
    if (!confirm(`Delete task "${title}"?`)) return;
    startTransition(async () => {
      const result = await deleteTaskAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Task deleted");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-2 sm:grid-cols-3">
          <Input
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tasks"
          />
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
          >
            <option value="ALL">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="ALL">All priorities</option>
            {Object.entries(taskPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={projects.length === 0}>
          <Plus className="size-4" />
          New task
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>Create a project first</CardTitle>
            <CardDescription>
              Tasks must belong to a project. Add a project before creating tasks.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((status) => {
            const columnTasks = filtered.filter((task) => task.status === status);
            return (
              <Card key={status} className="surface-glass">
                <CardHeader>
                  <CardTitle className="text-base">
                    {taskStatusLabels[status]}
                  </CardTitle>
                  <CardDescription>{columnTasks.length} tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  ) : (
                    columnTasks.map((task) => (
                      <article
                        key={task.id}
                        className="rounded-lg border border-border/60 bg-background/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-medium">{task.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {task.project.name} ·{" "}
                              {task.assignee?.name ??
                                task.assignee?.email ??
                                "Unassigned"}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {taskPriorityLabels[task.priority]}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {dueDateLabel(task.dueDate) ?? `Due ${formatDate(task.dueDate)}`}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Select
                            aria-label={`Change status for ${task.title}`}
                            value={task.status}
                            onChange={(e) =>
                              moveTask(task.id, e.target.value as TaskStatus)
                            }
                            disabled={pending}
                            className="h-8 text-xs"
                          >
                            {columns.map((value) => (
                              <option key={value} value={value}>
                                {taskStatusLabels[value]}
                              </option>
                            ))}
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditTask(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={pending}
                            onClick={() => removeTask(task.id, task.title)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </article>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projects={projects}
        members={members}
      />
      <TaskFormDialog
        open={Boolean(editTask)}
        onOpenChange={(open) => !open && setEditTask(null)}
        task={editTask ?? undefined}
        projects={projects}
        members={members}
      />
    </div>
  );
}
