"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  createProjectAction,
  updateProjectAction,
} from "@/lib/actions/project-actions";
import type { ProjectStatus } from "@prisma/client";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toInputDate } from "@/lib/format";
import type { ActionResult } from "@/lib/action-result";
import { projectStatusLabels } from "@/lib/labels";

type ProjectFormValues = {
  id?: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  deadline?: Date | null;
};

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectFormValues;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: ActionResult | undefined, formData: FormData) => {
      if (project?.id) {
        return updateProjectAction(project.id, prev, formData);
      }
      return createProjectAction(prev, formData);
    },
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(project ? "Project updated" : "Project created");
      onOpenChange(false);
      return;
    }
    toast.error(state.error);
  }, [state, onOpenChange, project]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={project ? "Edit project" : "Create project"}
      description="Define scope, status, and optional deadline."
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={project?.name ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={project?.description ?? ""}
            rows={3}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              defaultValue={project?.status ?? "PLANNING"}
            >
              {Object.entries(projectStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={toInputDate(project?.deadline)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
