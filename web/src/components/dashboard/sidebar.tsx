"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { NavMain, type NavItem } from "./main-nav";
import {
  IconAlignLeft,
  IconBook,
  IconChartBar,
  IconClipboardList,
  IconLanguage,
  IconLifebuoy,
  IconNotebook,
  IconNotes,
  IconRocket,
  IconTable,
  IconTicket,
  IconUserCircle,
} from "@tabler/icons-react";
import { href } from "react-router";
import { dashboardSidebarItems } from "@/lib/data/nav-data";

const navItems = [
  {
    title: "Help Center",
    url: "/theme-pages/faq",
    icon: IconLifebuoy,
  },
  {
    title: "Documentation",
    url: "#",
    icon: IconBook,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="px-0 h-full **:data-[slot=sidebar-inner]:h-full **:data-[slot=sidebar-inner]:bg-background">
      <div className="flex flex-col gap-2">
        {/* ---------------- Header ---------------- */}
        <SidebarHeader className="px-4 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <a href="#" className="w-full h-full">
                <img
                  src="https://images.shadcnspace.com/assets/shadcn-dashboard/logo/fulldark-logo.svg"
                  alt="fulldark-logo"
                  width={100}
                  height={32}
                  className="block dark:hidden"
                />
                <img
                  src="https://images.shadcnspace.com/assets/shadcn-dashboard/logo/fullwhite-logo.svg"
                  alt="fulldark-logo"
                  width={100}
                  height={32}
                  className="hidden dark:block"
                />
              </a>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ---------------- Content ---------------- */}
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="px-4">
              <NavMain items={dashboardSidebarItems} />
            </div>
            {/* card */}
            <div className="pt-5 px-4">
              <div className="-mx-4 border-t border-b border-border px-5 py-5">
                <div className="flex flex-col gap-5">
                  {/* Plan info */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-4">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconRocket className="size-5 shrink-0" />
                          <span className="font-medium text-base leading-6 text-foreground">
                            Basic Plan
                          </span>
                        </div>
                        <span className="font-medium text-base leading-6 text-foreground">70%</span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full w-[70%] bg-foreground rounded-full" />
                      </div>
                    </div>
                    {/* Usage text */}
                    <p className="text-sm font-normal leading-5 text-muted-foreground text-center">
                      68/100 monthly limit used
                    </p>
                  </div>
                  {/* Upgrade button */}
                  <Button className="w-full cursor-pointer h-9 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-sm font-medium">
                    Upgrade
                  </Button>
                </div>
              </div>
              <SidebarGroup className="mt-auto pt-4">
                <SidebarGroupContent>
                  <SidebarMenu className=" ">
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton size="lg" className="h-full cursor-pointer">
                          <a href={item.url}>
                            <div className="flex items-center gap-3 w-full">
                              <item.icon className="shadow-none size-5 shrink-0" />
                              <div className="flex flex-col flex-1 text-left text-sm leading-tight hide-menu whitespace-nowrap">
                                <span className="truncate font-medium">{item.title}</span>
                              </div>
                            </div>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </ScrollArea>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
