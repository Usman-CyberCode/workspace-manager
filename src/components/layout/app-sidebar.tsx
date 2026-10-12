"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Layers3,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "cn";
import { switchWorkspaceAction } from "@/lib/actions/workspace-actions";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: { id: string; name: string }[];
  activeWorkspaceId: string;
}) {
  const pathname = usePathname();

  async function onWorkspaceChange(workspaceId: string) {
    const result = await switchWorkspaceAction(workspaceId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Workspace switched");
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/70 bg-sidebar/80 backdrop-blur-md lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
        <span className="gradient-accent flex size-8 items-center justify-center rounded-lg text-primary-foreground">
          <Layers3 className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-none">Nexus Workspace</p>
          <p className="text-xs text-muted-foreground">Manager</p>
        </div>
      </div>

      <div className="p-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Active workspace
        </label>
        <Select
          value={activeWorkspaceId}
          onChange={(e) => onWorkspaceChange(e.target.value)}
          aria-label="Select workspace"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </Select>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
