import { IconGlobe } from "@tabler/icons-react";
import LanguageDropdown from "../dashboard/dropdown-language";
import Search from "../dashboard/search";
import { AppSidebar } from "../dashboard/sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import ProfileDropdown from "../dashboard/dropdown-profile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Outlet } from "react-router";

const Page = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* ---------------- Main ---------------- */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 bg-background">
          <SidebarTrigger className="cursor-pointer" />
          <div className="flex items-center gap-6">
            <Search />
            <div className="flex items-center gap-4">
              <LanguageDropdown
                trigger={
                  <div
                    id="language-dropdown-trigger"
                    className="rounded-md hover:bg-accent/80 cursor-pointer p-2"
                  >
                    <IconGlobe size={16} />
                  </div>
                }
              />
              <ProfileDropdown
                trigger={
                  <div id="profile-dropdown-trigger" className="rounded-full cursor-pointer">
                    <Avatar className="size-7 rounded-full">
                      <AvatarImage src="" />
                      <AvatarFallback>NJ</AvatarFallback>
                    </Avatar>
                  </div>
                }
              />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4" >
          <Outlet/>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Page;
