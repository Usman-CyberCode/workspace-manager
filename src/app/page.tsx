import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Kanban,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { SiteHeader } from "@/components/layout/site-header";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Kanban,
    title: "Kanban-ready task boards",
    description:
      "Move work from todo to done with accessible status controls, priorities, and due dates.",
  },
  {
    icon: Users,
    title: "Workspace collaboration",
    description:
      "Invite teammates, manage roles, and keep every project scoped to the right workspace.",
  },
  {
    icon: BarChart3,
    title: "Actionable dashboard",
    description:
      "See project counts, completion trends, recent activity, and upcoming deadlines at a glance.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description:
      "Server-side authorization, validated inputs, and workspace isolation on every mutation.",
  },
];

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.68_0.19_35_/_18%),transparent_45%),radial-gradient(circle_at_80%_0%,oklch(0.52_0.16_15_/_12%),transparent_40%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <Sparkles className="size-3.5 text-primary" />
                Built for modern product teams
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Run your workspace with clarity and momentum.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Nexus Workspace combines projects, tasks, team management, and
                insights in a polished dashboard designed for developers and
                operators who care about craft.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  render={
                    <Link href={session?.user ? "/dashboard" : "/sign-up"} />
                  }
                >
                  {session?.user ? "Go to dashboard" : "Start free"}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link href="/sign-in" />}
                >
                  Sign in
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <Card className="surface-glass overflow-hidden">
                <CardHeader>
                  <CardTitle>Workspace snapshot</CardTitle>
                  <CardDescription>
                    Illustrative preview only — dashboard stats come from your
                    database after sign-up.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Active projects", "12"],
                    ["Tasks in progress", "34"],
                    ["Due this week", "9"],
                    ["Team members", "8"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border/60 bg-background/40 p-4"
                    >
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1 text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <FadeIn className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything your team needs to ship
            </h2>
            <p className="mt-3 text-muted-foreground">
              From landing page to protected dashboard, Nexus Workspace is a
              full-stack SaaS starter with real persistence, auth, and polished
              UX patterns.
            </p>
          </FadeIn>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="h-full surface-glass">
                  <CardHeader>
                    <feature.icon className="size-5 text-primary" />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="border-t border-border/60 bg-card/20">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                Ready to organize your next release?
              </h3>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Create a workspace in minutes, invite your team, and keep work
                moving with a dashboard your whole org will enjoy using.
              </p>
            </div>
            <Button size="lg" render={<Link href="/sign-up" />}>
              Create workspace
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nexus Workspace. Crafted for learning and production deployment.
      </footer>
    </div>
  );
}
