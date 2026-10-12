"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import {
  createTaskAction,
  updateTaskAction,
} from "@/lib/actions/task-actions";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toInputDate } from "@/lib/format";
import type { ActionResult } from "@/lib/action-result";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/labels";

type TaskFormValues = {
  id?: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string | null;
  dueDate?: Date | null;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  projects,
  members,
  defaultProjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskFormValues;
  projects: { id: string; name: string }[];
  members: { id: string; name: string | null; email: string }[];
  defaultProjectId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: ActionResult | undefined, formData: FormData) => {
      if (task?.id) {
        return updateTaskAction(task.id, prev, formData);
      }
      return createTaskAction(prev, formData);
    },
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(task ? "Task updated" : "Task created");
      onOpenChange(false);
      return;
    }
    toast.error(state.error);
  }, [state, onOpenChange, task]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Edit task" : "Create task"}
      description="Assign work, set priority, and track due dates."
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={task?.title ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={task?.description ?? ""}
            rows={3}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <Select
              id="projectId"
              name="projectId"
              defaultValue={task?.projectId ?? defaultProjectId ?? projects[0]?.id}
              required
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigneeId">Assignee</Label>
            <Select
              id="assigneeId"
              name="assigneeId"
              defaultValue={task?.assigneeId ?? ""}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name ?? member.email}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={task?.status ?? "TODO"}>
              {Object.entries(taskStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              name="priority"
              defaultValue={task?.priority ?? "MEDIUM"}
            >
              {Object.entries(taskPriorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={toInputDate(task?.dueDate)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : task ? "Save task" : "Create task"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
