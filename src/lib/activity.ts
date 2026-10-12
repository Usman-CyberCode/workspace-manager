import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logActivity(input: {
  type: ActivityType;
  message: string;
  workspaceId: string;
  userId?: string;
  projectId?: string;
  taskId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.activity.create({
    data: {
      type: input.type,
      message: input.message,
      workspaceId: input.workspaceId,
      userId: input.userId,
      projectId: input.projectId,
      taskId: input.taskId,
      metadata: input.metadata,
    },
  });
}
