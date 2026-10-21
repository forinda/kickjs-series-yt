import { IconSelector } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-store";
import { displayName, initials } from "@/lib/utils";
import ProfileDropdown from "./dropdown-profile";

/** Signed-in user pinned to the bottom of the sidebar; opens the account menu. */
export function SidebarUser() {
  const { user } = useAuth();
  const { isMobile, state } = useSidebar();
  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ProfileDropdown
          asChild
          // Up from the bottom edge; beside the rail when the sidebar is collapsed to icons.
          side={isMobile || state === "expanded" ? "top" : "right"}
          align={isMobile || state === "expanded" ? "start" : "end"}
          trigger={
            <SidebarMenuButton
              size="lg"
              aria-label="Account menu"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage src={user.user.avatar ?? undefined} alt="" className="object-cover" />
                <AvatarFallback>{initials(user.user)}</AvatarFallback>
              </Avatar>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">{displayName(user.user)}</span>
                <span className="truncate text-xs text-muted-foreground">{user.user.email}</span>
              </span>
              <IconSelector className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
