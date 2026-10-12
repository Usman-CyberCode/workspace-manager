import Link from "next/link";
import { Layers3 } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="gradient-accent flex size-8 items-center justify-center rounded-lg text-primary-foreground shadow-sm">
            <Layers3 className="size-4" />
          </span>
          <span>Nexus Workspace</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#features"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Features
          </Link>
          {session?.user ? (
            <Button render={<Link href="/dashboard" />}>Open dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/sign-in" />}>
                Sign in
              </Button>
              <Button render={<Link href="/sign-up" />}>Get started</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
