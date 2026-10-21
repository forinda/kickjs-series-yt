import { Link, matchPath, useLocation } from "react-router";
import type { Icon } from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";
import { can, type PermissionKey } from "@/lib/permissions";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type NavItem =
  | { isSection: true; label: string; permission?: PermissionKey }
  | { isSection?: false; title: string; icon: Icon; href: string; exact?: boolean; permission?: PermissionKey };

/** Items the user may see; a section disappears when it has nothing left under it. */
export const visibleNavItems = (items: NavItem[], allowed: (key: PermissionKey) => boolean) => {
  const permitted = items.filter((item) => !item.permission || allowed(item.permission));
  return permitted.filter(
    (item, i) => !item.isSection || (permitted[i + 1] !== undefined && !permitted[i + 1].isSection),
  );
};

/** Sidebar navigation. The active item follows the URL, so deep links and back/forward stay right. */
export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return visibleNavItems(items, (key) => can(user?.user, key)).map((item) =>
    item.isSection ? (
      <SidebarGroup key={item.label} className="p-0 pt-5 first:pt-0">
        <SidebarGroupLabel className="p-0 text-xs font-medium uppercase text-sidebar-foreground/70">
          {item.label}
        </SidebarGroupLabel>
      </SidebarGroup>
    ) : (
      <SidebarGroup key={item.href} className="p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={!!matchPath({ path: item.href, end: !!item.exact }, pathname)}
              // The stock active style is a neutral accent; the current page uses the brand colour.
              className="h-9 px-3 py-2 font-medium data-active:bg-sidebar-primary! data-active:text-sidebar-primary-foreground!"
            >
              <Link to={item.href}>
                <item.icon />
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    ),
  );
}
