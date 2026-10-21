import type { NavItem, Visibility } from "@/components/dashboard/main-nav";
import type { PermissionKey } from "@/lib/permissions";
import { IconArticle, IconBookmark, IconCategory, IconFiles, IconLayoutDashboard, IconPencilStar, IconUserCircle, IconUsers } from "@tabler/icons-react";
import { href } from "react-router";

export const dashboardSidebarItems: NavItem[] = [
  { label: "Overview", isSection: true },
  // exact: every dashboard page lives under /dashboard, so prefix matching would always light this up
  { title: "Dashboard", icon: IconLayoutDashboard, href: href("/dashboard"), exact: true },

  { label: "Content", isSection: true },
  { title: "Articles", icon: IconArticle, href: href("/dashboard/articles"), permission: "WRITE" },
  // Categories are curated by admins; writers pick from them in the editor.
  { title: "Categories", icon: IconCategory, href: href("/dashboard/categories"), permission: "ADMIN" },

  { label: "Reading", isSection: true },
  { title: "Bookmarks", icon: IconBookmark, href: href("/dashboard/bookmarks") },

  { label: "Moderation", isSection: true, permission: "MODERATE" },
  { title: "All articles", icon: IconFiles, href: href("/dashboard/manage/articles"), permission: "MODERATE" },

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
  // Readers only: writers already write, and moderators get role changes from an admin.
  {
    title: "Writer access",
    icon: IconPencilStar,
    href: href("/dashboard/writer-access"),
    hideWith: ["WRITE", "MODERATE"],
  },
];

export const isVisible = (item: Visibility, allowed: (key: PermissionKey) => boolean) =>
  (!item.permission || allowed(item.permission)) && !item.hideWith?.some(allowed);

/** Items the user may see; a section disappears when it has nothing left under it. */
export const visibleNavItems = (items: NavItem[], allowed: (key: PermissionKey) => boolean) => {
  const permitted = items.filter((item) => isVisible(item, allowed));
  return permitted.filter(
    (item, i) => !item.isSection || (permitted[i + 1] !== undefined && !permitted[i + 1].isSection),
  );
};
