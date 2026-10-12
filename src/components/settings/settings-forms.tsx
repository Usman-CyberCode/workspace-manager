"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileAction } from "@/lib/actions/profile-actions";
import {
  createWorkspaceAction,
  updateWorkspaceAction,
} from "@/lib/actions/workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileSettingsForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success("Profile updated");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Display name</Label>
        <Input id="profile-name" name="name" defaultValue={name} required />
      </div>
      <Button type="submit" disabled={pending}>
        Save profile
      </Button>
    </form>
  );
}

export function WorkspaceSettingsForm({
  name,
  description,
  canEdit,
}: {
  name: string;
  description: string | null;
  canEdit: boolean;
}) {
  const [state, action, pending] = useActionState(updateWorkspaceAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success("Workspace updated");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          name="name"
          defaultValue={name}
          required
          disabled={!canEdit}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspace-description">Description</Label>
        <Textarea
          id="workspace-description"
          name="description"
          defaultValue={description ?? ""}
          disabled={!canEdit}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={!canEdit || pending}>
        Save workspace
      </Button>
    </form>
  );
}

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createWorkspaceAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Workspace created");
      router.push("/dashboard");
      router.refresh();
      return;
    }
    toast.error(state.error);
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-workspace-name">Workspace name</Label>
        <Input id="new-workspace-name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-workspace-description">Description</Label>
        <Textarea id="new-workspace-description" name="description" rows={3} />
      </div>
      <Button type="submit" disabled={pending}>
        Create workspace
      </Button>
    </form>
  );
}
