import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "@/components/page-header";
import { dashboardSidebarItems } from "@/lib/data/nav-data";
import { NavMain } from "./main-nav";
import { SidebarUser } from "./sidebar-user";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* Nav scrolls on its own; header and footer stay put. */}
      <SidebarContent className="min-h-0">
        <ScrollArea className="h-full">
          <div className="px-4">
            <NavMain items={dashboardSidebarItems} />
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
