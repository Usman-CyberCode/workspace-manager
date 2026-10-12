"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { removeMemberAction } from "@/lib/actions/workspace-actions";
import { Button } from "@/components/ui/button";

export function RemoveMemberButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Remove ${memberName} from this workspace?`)) return;
        startTransition(async () => {
          const result = await removeMemberAction(memberId);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Member removed");
        });
      }}
    >
      Remove
    </Button>
  );
}
