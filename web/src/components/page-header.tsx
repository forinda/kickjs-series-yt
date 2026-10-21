import { href, Link, NavLink } from "react-router";
import { useAuth } from "@/context/auth-store";
import { initials } from "@/lib/utils";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ProfileDropdown from "./dashboard/dropdown-profile";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
        In
      </span>
      Inkwell
    </Link>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors hover:text-foreground ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`;

export default function PageHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>
              Articles
            </NavLink>
            {user && (
              <NavLink to={href("/dashboard")} className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
          </nav>
        </div>

        {user ? (
          <ProfileDropdown
            trigger={
              <Avatar className="size-8">
                <AvatarImage src={user.user.avatar ?? undefined} alt="" className="object-cover" />
                <AvatarFallback>{initials(user.user)}</AvatarFallback>
              </Avatar>
            }
          />
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/auth?page=register">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
