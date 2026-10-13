import { useAuth } from "@/context/auth-context";
import React from "react";
import { Button } from "./ui/button";
import CreateArticleDialog from "./create-article-dialog";

export default function PageHeader() {
  const [isCreateArticleDialogOpen, setIsCreateArticleDialogOpen] = React.useState(false);
  const links = [
    ["Home", "#"],
    ["Blog", "#blog"],
    ["Newsletter", "#newsletter"],
    ["About", "#about"],
  ];
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-50 dark:text-zinc-900">
              In
            </span>
            Inkwell
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <CreateArticleDialog
                isOpen={isCreateArticleDialogOpen}
                toggleModal={(state) => setIsCreateArticleDialogOpen(state)}
              />
              <div className="relative">
                <Button
                  aria-label="Account menu"
                  variant={"ghost"}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  {user.user.name}
                </Button>
                <Button
                  aria-label="Account menu"
                  variant={"destructive"}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                onClick={() => logout()}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>Login</>
          )}
        </div>
      </div>
    </header>
  );
}
