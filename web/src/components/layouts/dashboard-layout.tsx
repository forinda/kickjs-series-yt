import { AppSidebar } from "../dashboard/sidebar";
import { CommandSearch } from "../dashboard/command-search";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import ProfileDropdown from "../dashboard/dropdown-profile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Outlet } from "react-router";
import Protect from "../auth/protect";
import { useAuth } from "@/context/auth-store";
import { initials } from "@/lib/utils";
import { useEffect } from "react";
import { useMyProfile } from "@/features/auth/queries";
import type { LoginResponse } from "@/features/auth/mutations";

const Page = () => {
  const { user, updateUser } = useAuth();
  // The stored session can be stale (an admin may have changed this user's role); the
  // dashboard re-reads the profile on load so menus and guards reflect the current role.
  const { data: profile } = useMyProfile(!!user);
  useEffect(() => {
    if (profile) updateUser(profile as unknown as LoginResponse["user"]);
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only when fresh profile data arrives
  }, [profile]);

  return (
    <Protect>
    <SidebarProvider>
      <AppSidebar />
      {/* ---------------- Main ---------------- */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
          <div className="flex flex-1 items-center gap-3">
            <SidebarTrigger className="cursor-pointer" />
            <CommandSearch />
          </div>
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
