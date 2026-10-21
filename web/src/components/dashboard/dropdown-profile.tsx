import type { ReactElement } from "react";
import { href, Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconExternalLink, IconLayoutDashboard, IconLogout, IconUser } from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";
import { displayName, initials } from "@/lib/utils";

type Props = {
  trigger: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  /** The trigger is already a button: use it as the trigger instead of wrapping it in another. */
  asChild?: boolean;
};

const itemClass = "px-4 py-2.5 text-base cursor-pointer gap-3";

const ProfileDropdown = ({ trigger, defaultOpen, align = "end", side = "bottom", asChild }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Leave the dashboard first (committed synchronously) so <Protect> doesn't bounce us to /auth?_next=…
  const signOut = () => {
    navigate("/", { flushSync: true });
    logout();
  };

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild={asChild}>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align={align} side={side} sideOffset={6}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-4 py-2.5 font-normal">
            <Avatar className="size-10">
              <AvatarImage src={user?.user.avatar ?? undefined} alt="" className="object-cover" />
              <AvatarFallback>{initials(user?.user)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-foreground">{displayName(user?.user)}</span>
              <span className="truncate text-sm text-muted-foreground">{user?.user.email}</span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild className={itemClass}>
            <Link to={href("/dashboard")}>
              <IconLayoutDashboard size={20} className="text-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link to={href("/dashboard/profile")}>
              <IconUser size={20} className="text-foreground" />
              My profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <Link to="/">
              <IconExternalLink size={20} className="text-foreground" />
              View blog
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" className={itemClass} onSelect={signOut}>
            <IconLogout size={20} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
