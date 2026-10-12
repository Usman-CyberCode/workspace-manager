import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <FadeIn className="w-full max-w-md">
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to manage projects, tasks, and your team workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
