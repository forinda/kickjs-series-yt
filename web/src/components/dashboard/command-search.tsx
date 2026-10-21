import { useEffect, useState } from "react";
import { href, useNavigate } from "react-router";
import { Command } from "cmdk";
import {
  IconArticle,
  IconCategory,
  IconCategoryPlus,
  IconExternalLink,
  IconPencilPlus,
  IconSearch,
  IconUserEdit,
  type Icon,
} from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { useAllMyBlogs } from "@/features/blogs/queries";
import { useCategories } from "@/features/categories/queries";
import { dashboardSidebarItems } from "@/lib/data/nav-data";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

const actions: { label: string; to: string; icon: Icon; keywords?: string[] }[] = [
  { label: "Write a new article", to: href("/dashboard/articles/new"), icon: IconPencilPlus, keywords: ["create", "post", "draft"] },
  { label: "Add a category", to: `${href("/dashboard/categories")}?new`, icon: IconCategoryPlus, keywords: ["create", "new"] },
  { label: "Edit your profile", to: href("/dashboard/profile"), icon: IconUserEdit, keywords: ["account", "bio", "avatar", "settings"] },
  { label: "View the blog", to: "/", icon: IconExternalLink, keywords: ["home", "public", "site"] },
];

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Every typed word must appear in the item's visible text (its keywords). cmdk's default
 * scorer matches letters in order anywhere ("kube" hit "KickJS published") and also searched
 * `value`, which holds database ids. Word-start matches rank above mid-word ones.
 */
const filter = (_value: string, search: string, keywords: string[] = []) => {
  const text = keywords.join(" ").toLowerCase();
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.every((w) => text.includes(w))) return 0;
  return words.every((w) => new RegExp(`(^|\\W)${escapeRegex(w)}`).test(text)) ? 1 : 0.5;
};

const groupHeading =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground";
// Same highlight as the Combobox, so pickers and the palette feel like one control.
const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-primary/10 aria-selected:text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

/** Header button + Ctrl/⌘ K command palette for jumping around the dashboard. */
export function CommandSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); // browsers bind Ctrl+K to the address bar
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <IconSearch className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[11px] sm:inline">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="top-[20%]! translate-y-0! gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search the dashboard</DialogTitle>
          <DialogDescription className="sr-only">Find pages, actions, your articles and categories.</DialogDescription>
          {open && <Palette close={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Palette({ close }: { close: () => void }) {
  const navigate = useNavigate();
  // Controlled so a new query always highlights its best match; cmdk otherwise keeps the
  // previous highlight if it still matches, even when a better result ranks above it.
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const { user } = useAuth();
  const { data: articles = [] } = useAllMyBlogs(user?.user._id ?? "");
  const { data: categories = [] } = useCategories();

  const go = (to: string) => {
    close();
    navigate(to);
  };

  return (
    <Command loop filter={filter} value={highlighted} onValueChange={setHighlighted} className="flex flex-col">
      <div className="flex items-center gap-2 border-b px-3">
        <IconSearch className="size-4 shrink-0 text-muted-foreground" />
        <Command.Input
          autoFocus
          value={search}
          onValueChange={(next) => {
            setSearch(next);
            setHighlighted(""); // cmdk re-selects the first (best) item
          }}
          placeholder="Search pages, actions, articles, categories…"
          className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <Command.List className={`max-h-96 overflow-y-auto p-2 ${groupHeading}`}>
        <Command.Empty className="py-10 text-center text-sm text-muted-foreground">No results.</Command.Empty>

        <Command.Group heading="Pages">
          {dashboardSidebarItems.map((item) =>
            item.isSection ? null : (
              <Command.Item key={item.href} value={`page ${item.title}`} keywords={[item.title, "page"]} onSelect={() => go(item.href)} className={itemClass}>
                <item.icon />
                {item.title}
              </Command.Item>
            ),
          )}
        </Command.Group>

        <Command.Group heading="Actions">
          {actions.map((a) => (
            <Command.Item key={a.label} value={`action ${a.label}`} keywords={[a.label, ...(a.keywords ?? [])]} onSelect={() => go(a.to)} className={itemClass}>
              <a.icon />
              {a.label}
            </Command.Item>
          ))}
        </Command.Group>

        {articles.length > 0 && (
          <Command.Group heading="Your articles">
            {articles.map((a) => (
              <Command.Item
                key={a._id}
                // Unique per article (titles can repeat across statuses); searchable by title and status.
                value={`article ${a._id} ${a.title}`}
                keywords={[a.title, a.status]}
                onSelect={() => go(href("/dashboard/articles/:id/edit", { id: a._id }))}
                className={itemClass}
              >
                <IconArticle />
                <span className="flex-1 truncate">{a.title}</span>
                <span className="text-xs capitalize text-muted-foreground">{a.status.replace("-", " ")}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {categories.length > 0 && (
          <Command.Group heading="Categories">
            {categories.map((c) => (
              <Command.Item
                key={c._id}
                value={`category ${c._id} ${c.name}`}
                keywords={[c.name, c.description]}
                onSelect={() => go(href("/dashboard/categories"))}
                className={itemClass}
              >
                <IconCategory />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="truncate text-xs text-muted-foreground">{c.description}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
      <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
        <span><kbd className="font-mono">↑↓</kbd> navigate</span>
        <span><kbd className="font-mono">↵</kbd> open</span>
        <span><kbd className="font-mono">esc</kbd> close</span>
      </div>
    </Command>
  );
}
