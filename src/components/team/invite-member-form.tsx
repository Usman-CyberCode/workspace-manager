"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { inviteMemberAction } from "@/lib/actions/workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function InviteMemberForm() {
  const [state, action, pending] = useActionState(inviteMemberAction, undefined);
  const lastToast = useRef<typeof state>(undefined);

  useEffect(() => {
    if (!state || state === lastToast.current) return;
    lastToast.current = state;
    if (!state.success) {
      toast.error(state.error);
      return;
    }
    toast.success("Invitation created");
  }, [state]);

  const invitePath =
    state?.success && state.data.token
      ? `/settings?invite=${state.data.token}`
      : null;

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" defaultValue="MEMBER">
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Create invitation link"}
      </Button>
      {invitePath ? (
        <Alert className="break-all text-xs">
          Share this link with the invitee (valid 7 days):{" "}
          <span className="text-primary">{invitePath}</span>
        </Alert>
      ) : null}
    </form>
  );
}
