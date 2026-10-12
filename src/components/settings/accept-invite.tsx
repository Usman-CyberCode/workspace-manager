"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptInvitationAction } from "@/lib/actions/workspace-actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function AcceptInviteButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Alert className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span>You have a pending workspace invitation.</span>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await acceptInvitationAction(token);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success("Invitation accepted");
            router.replace("/dashboard");
            router.refresh();
          })
        }
      >
        {pending ? "Accepting…" : "Accept invitation"}
      </Button>
    </Alert>
  );
}
