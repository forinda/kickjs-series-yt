import type { NavItem } from "@/components/dashboard/main-nav";
import type { PermissionKey } from "@/lib/permissions";
import { IconArticle, IconCategory, IconLayoutDashboard, IconPencilStar, IconUserCircle, IconUsers } from "@tabler/icons-react";
import { href } from "react-router";

export const dashboardSidebarItems: NavItem[] = [
  { label: "Overview", isSection: true },
  // exact: every dashboard page lives under /dashboard, so prefix matching would always light this up
  { title: "Dashboard", icon: IconLayoutDashboard, href: href("/dashboard"), exact: true },

  { label: "Content", isSection: true },
  { title: "Articles", icon: IconArticle, href: href("/dashboard/articles") },
  { title: "Categories", icon: IconCategory, href: href("/dashboard/categories") },

  { label: "Administration", isSection: true, permission: "ADMIN" },
  { title: "Users", icon: IconUsers, href: href("/dashboard/users"), permission: "ADMIN" },
  {
    title: "Writer requests",
    icon: IconPencilStar,
    href: href("/dashboard/writer-requests"),
    permission: "ADMIN",
    badge: "pendingWriterRequests",
  },

  { label: "Account", isSection: true },
  { title: "Profile", icon: IconUserCircle, href: href("/dashboard/profile") },
];

/** Items the user may see; a section disappears when it has nothing left under it. */
export const visibleNavItems = (items: NavItem[], allowed: (key: PermissionKey) => boolean) => {
  const permitted = items.filter((item) => !item.permission || allowed(item.permission));
  return permitted.filter(
    (item, i) => !item.isSection || (permitted[i + 1] !== undefined && !permitted[i + 1].isSection),
  );
};
