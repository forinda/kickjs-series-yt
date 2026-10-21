import { AppSidebar } from "../dashboard/sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import ProfileDropdown from "../dashboard/dropdown-profile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Outlet } from "react-router";
import Protect from "../auth/protect";
import { useAuth } from "@/context/auth-context";
import { initials } from "@/lib/utils";

const Page = () => {
  const { user } = useAuth();
  return (
    <Protect>
    <SidebarProvider>
      <AppSidebar />
      {/* ---------------- Main ---------------- */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
          <SidebarTrigger className="cursor-pointer" />
          {/* On desktop the account menu lives in the sidebar footer; phones hide the sidebar. */}
          <div className="md:hidden">
            <ProfileDropdown
              trigger={
                <Avatar id="profile-dropdown-trigger" className="size-7">
                  <AvatarImage src={user?.user.avatar ?? undefined} alt="" className="object-cover" />
                  <AvatarFallback>{initials(user?.user)}</AvatarFallback>
                </Avatar>
              }
            />
          </div>
        </header>
        <main className="flex-1 p-4" >
          <Outlet/>
        </main>
      </div>
    </SidebarProvider>
    </Protect>
  );
};

export default Page;
