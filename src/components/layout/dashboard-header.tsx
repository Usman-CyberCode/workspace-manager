import { signOutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader({
  title,
  description,
  breadcrumbs,
  userName,
}: {
  title: string;
  description?: string;
  breadcrumbs?: string[];
  userName?: string | null;
}) {
  return (
    <header className="border-b border-border/60 bg-background/60 backdrop-blur-md">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {breadcrumbs?.length ? (
            <p className="mb-1 text-xs text-muted-foreground">
              {breadcrumbs.join(" / ")}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {userName ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {userName}
            </span>
          ) : null}
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
