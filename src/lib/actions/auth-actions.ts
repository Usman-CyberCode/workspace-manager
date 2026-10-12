"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { uniqueWorkspaceSlug } from "@/lib/slugify";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";
import { logActivity } from "@/lib/activity";

export async function signUpAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    workspaceName: String(formData.get("workspaceName") ?? ""),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const slug = await uniqueWorkspaceSlug(parsed.data.workspaceName);

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      memberships: {
        create: {
          role: "OWNER",
          workspace: {
            create: {
              name: parsed.data.workspaceName,
              slug,
            },
          },
        },
      },
    },
    include: {
      memberships: { include: { workspace: true } },
    },
  });

  const workspace = user.memberships[0]?.workspace;
  if (workspace) {
    await logActivity({
      type: "MEMBER_JOINED",
      message: `${user.name ?? user.email} created workspace "${workspace.name}"`,
      workspaceId: workspace.id,
      userId: user.id,
    });
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail("Account created but sign-in failed. Please sign in manually.");
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function signInAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail("Invalid email or password.");
    }
    throw error;
  }

  return ok(null);
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
