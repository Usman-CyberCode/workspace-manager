import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

/**
 * Optional demo seed — run only in local/dev environments.
 * Creates sample users, a workspace, projects, and tasks labeled as demo data.
 */
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.local" },
    update: {},
    create: {
      email: "owner@demo.local",
      name: "Demo Owner",
      passwordHash,
    },
  });

  const teammate = await prisma.user.upsert({
    where: { email: "member@demo.local" },
    update: {},
    create: {
      email: "member@demo.local",
      name: "Demo Member",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      description: "Seeded demo workspace for local testing.",
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: { userId: owner.id, workspaceId: workspace.id },
    },
    update: { role: "OWNER" },
    create: {
      userId: owner.id,
      workspaceId: workspace.id,
      role: "OWNER",
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: { userId: teammate.id, workspaceId: workspace.id },
    },
    update: { role: "MEMBER" },
    create: {
      userId: teammate.id,
      workspaceId: workspace.id,
      role: "MEMBER",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-launch" },
    update: {},
    create: {
      id: "seed-project-launch",
      name: "Launch Readiness",
      description: "Demo project created by prisma/seed.ts",
      status: "ACTIVE",
      workspaceId: workspace.id,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Finalize onboarding flow",
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: project.id,
        assigneeId: owner.id,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
      {
        title: "Review analytics events",
        status: "TODO",
        priority: "MEDIUM",
        projectId: project.id,
        assigneeId: teammate.id,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      {
        title: "Ship production build",
        status: "DONE",
        priority: "URGENT",
        projectId: project.id,
        assigneeId: owner.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Demo seed complete.");
  console.log("Sign in with owner@demo.local / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
