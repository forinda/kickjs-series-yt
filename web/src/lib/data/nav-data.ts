import type { NavItem } from "@/components/dashboard/main-nav";
import { IconAlignLeft, IconChartBar, IconClipboardList, IconLanguage, IconNotebook, IconNotes, IconTable, IconTicket, IconUserCircle } from "@tabler/icons-react";
import { href } from "react-router";

 export const dashboardSidebarItems: NavItem[] = [
  // Dashboards Section
  { label: "Dashboards", isSection: true },
  { title: "Dashboard", icon: IconChartBar, href: href("/dashboard") },
//   { title: "CRM Dashboard", icon: IconClipboardList, href: "#" },

  // Pages Section
  { label: "Pages", isSection: true },
  { title: "Tables", icon: IconTable, href: "#" },
  { title: "Forms", icon: IconClipboardList, href: "#" },
  { title: "User Profile", icon: IconUserCircle, href: href("/dashboard/profile") },

  // Apps Section
  { label: "Apps", isSection: true },
  { title: "Notes", icon: IconNotebook, href: "#" },
  { title: "Tickets", icon: IconTicket, href: "#" },
  {
    title: "Blogs",
    icon: IconLanguage,
    children: [
      { title: "Blog Post", href: "#" },
      { title: "Blog Detail", href: "#" },
      { title: "Blog Edit", href: "#" },
      { title: "Blog Create", href: "#" },
      { title: "Manage Blogs", href: "#" },
    ],
  },

  // Form Elements Section
  { label: "Form Elements", isSection: true },
  {
    title: "Shadcn Forms",
    icon: IconNotes,
    children: [
      { title: "Button", href: "#" },
      { title: "Input", href: "#" },
      { title: "Select", href: "#" },
      { title: "Checkbox", href: "#" },
      { title: "Radio", href: "#" },
    ],
  },
//   {
//     title: "Form layouts",
//     icon: IconAlignLeft,
//     children: [
//       { title: "Forms Horizontal", href: "#" },
//       { title: "Forms Vertical", href: "#" },
//       { title: "Forms Validation", href: "#" },
//       { title: "Forms Examples", href: "#" },
//       { title: "Forms Wizard", href: "#" },
//     ],
//   },
];
