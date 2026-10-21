import type { NavItem } from "@/components/dashboard/main-nav";
import { IconArticle, IconCategory, IconLayoutDashboard, IconUserCircle } from "@tabler/icons-react";
import { href } from "react-router";

export const dashboardSidebarItems: NavItem[] = [
  { label: "Overview", isSection: true },
  // exact: every dashboard page lives under /dashboard, so prefix matching would always light this up
  { title: "Dashboard", icon: IconLayoutDashboard, href: href("/dashboard"), exact: true },

  { label: "Content", isSection: true },
  { title: "Articles", icon: IconArticle, href: href("/dashboard/articles") },
  { title: "Categories", icon: IconCategory, href: href("/dashboard/categories") },

  { label: "Account", isSection: true },
  { title: "Profile", icon: IconUserCircle, href: href("/dashboard/profile") },
];
