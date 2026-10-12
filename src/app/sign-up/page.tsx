import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <FadeIn className="w-full max-w-md">
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle>Create your workspace</CardTitle>
            <CardDescription>
              Start with a secure account and your first collaborative workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
