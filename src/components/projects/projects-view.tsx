"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Grid2X2, List, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ProjectStatus } from "@prisma/client";
import { deleteProjectAction } from "@/lib/actions/project-actions";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
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
import { formatDate } from "@/lib/format";
import { projectStatusLabels } from "@/lib/labels";

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  deadline: Date | null;
  _count: { tasks: number };
};

export function ProjectsView({ projects }: { projects: ProjectListItem[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectListItem | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesQuery =
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        (project.description ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" || project.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, status]);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete project "${name}" and all of its tasks?`)) return;
    startTransition(async () => {
      const result = await deleteProjectAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Project deleted");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="sm:max-w-[180px]"
          >
            <option value="ALL">All statuses</option>
            {Object.entries(projectStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New project
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>No projects found</CardTitle>
            <CardDescription>
              Adjust filters or create your first project for this workspace.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <Card key={project.id} className="surface-glass">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:text-primary"
                      >
                        {project.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {projectStatusLabels[project.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>{project._count.tasks} tasks</span>
                <span>{formatDate(project.deadline)}</span>
              </CardContent>
              <CardContent className="flex gap-2 pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditProject(project)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => handleDelete(project.id, project.name)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tasks</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {projectStatusLabels[project.status]}
                  </td>
                  <td className="px-4 py-3">{project._count.tasks}</td>
                  <td className="px-4 py-3">{formatDate(project.deadline)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditProject(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={pending}
                        onClick={() => handleDelete(project.id, project.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ProjectFormDialog
        open={Boolean(editProject)}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject ?? undefined}
      />
    </div>
  );
}
