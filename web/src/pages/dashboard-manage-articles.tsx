import { useEffect, useState } from "react";
import { href, Link } from "react-router";
import { toast } from "sonner";
import { IconChevronLeft, IconChevronRight, IconExternalLink, IconLoader2, IconSearch } from "@tabler/icons-react";
import { PostThumbnail, postAuthor, postCategory } from "@/components/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-store";
import type { BlogPostType } from "@/features/blogs/queries";
import {
  useDeleteManagedArticle,
  useManagedArticles,
  useRestoreArticle,
  useTakeDownArticle,
  type ManagedArticle,
  type ManagedArticlesFilter,
} from "@/features/blogs/manage";
import { searchCategories } from "@/features/categories/queries";
import { useSetCommentsEnabled } from "@/features/engagement/api";
import { extractError } from "@/lib/api";
import { can } from "@/lib/permissions";
import { displayName } from "@/lib/utils";

const PAGE_SIZE = 20;
const STATUS_ITEMS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "in-review", label: "In review" },
  { value: "archived", label: "Archived" },
  { value: "taken-down", label: "Taken down", description: "Hidden by a moderator" },
];
const STATUS_BADGE = { published: "default", draft: "secondary", "in-review": "outline", archived: "outline" } as const;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const formatDate = (iso: string | Date) => new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });

function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function DashboardManageArticles() {
  const { user } = useAuth();
  const isAdmin = can(user?.user, "ADMIN");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const q = useDebounced(search.trim());

  const filter: ManagedArticlesFilter = {
    page,
    limit: PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(status === "taken-down" ? { takenDown: "true" as const } : status ? { status: status as ManagedArticlesFilter["status"] } : {}),
    ...(category ? { category } : {}),
  };
  const { data, isLoading, isFetching } = useManagedArticles(filter);
  const restore = useRestoreArticle();
  const setComments = useSetCommentsEnabled();
  const [takingDown, setTakingDown] = useState<ManagedArticle | null>(null);
  const [deleting, setDeleting] = useState<ManagedArticle | null>(null);

  const total = data?.total ?? 0;
  const to = Math.min(page * PAGE_SIZE, total);
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-bold">All articles</h1>
        <p className="text-muted-foreground">
          Every article on Inkwell, in any status. Take down anything that breaks the rules
          {isAdmin ? "; delete only when it must go entirely." : "."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Search by title…"
            aria-label="Search articles"
            className="h-9 pl-9"
          />
        </div>
        <Combobox aria-label="Filter by status" value={status} onChange={resetPage(setStatus)} items={STATUS_ITEMS} placeholder="Any status" className="w-44" triggerClassName="h-9!" />
        <Combobox
          aria-label="Filter by category"
          value={category}
          onChange={resetPage(setCategory)}
          onSearch={searchCategories}
          placeholder="Any category"
          searchPlaceholder="Search categories…"
          className="w-48"
          triggerClassName="h-9!"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Article</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-10" />
                  </td>
                </tr>
              ))}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No articles match these filters.
                </td>
              </tr>
            )}
            {data?.items.map((row) => {
              const post = row as unknown as BlogPostType;
              const takedown = row.takedown as { at: string; reason: string; by?: { name?: string } | null } | null;
              return (
                <tr key={String(row._id)} className="align-top hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <PostThumbnail post={post} className="aspect-video w-16 shrink-0 rounded-md" />
                      <div className="min-w-0">
                        <div className="font-medium">{row.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {postCategory(post) || "Uncategorised"} · {plural(row.likeCount ?? 0, "like")} · {plural(row.commentCount ?? 0, "comment")}
                          {row.commentsEnabled === false && " · comments closed"}
                        </div>
                        {takedown && (
                          <p className="mt-1 text-xs text-destructive">
                            Taken down {formatDate(takedown.at)}
                            {takedown.by && typeof takedown.by === "object" ? ` by ${displayName(takedown.by)}` : ""}: "{takedown.reason}"
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{postAuthor(post)}</td>
                  <td className="px-4 py-3">
                    {takedown ? (
                      <Badge variant="destructive">Taken down</Badge>
                    ) : (
                      <Badge variant={STATUS_BADGE[row.status]} className="capitalize">
                        {row.status.replace("-", " ")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(row.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {row.status === "published" && (
                        <Button variant="ghost" size="icon" asChild aria-label="View article">
                          <Link to={href("/blogs/:id", { id: String(row._id) })} target="_blank">
                            <IconExternalLink />
                          </Link>
                        </Button>
                      )}
                      {takedown ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={restore.isPending}
                          onClick={() =>
                            restore.mutate(String(row._id), {
                              onSuccess: () => toast.success(`"${row.title}" is live again.`),
                              onError: (error) => toast.error(extractError(error, "Could not restore the article.")),
                            })
                          }
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setTakingDown(row)}>
                          Take down
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={setComments.isPending}
                        onClick={() => {
                          const enabled = row.commentsEnabled === false;
                          setComments.mutate(
                            { id: String(row._id), enabled },
                            {
                              onSuccess: () => toast.success(enabled ? "Comments reopened." : "Comments closed."),
                              onError: (error) => toast.error(extractError(error, "Could not change comments.")),
                            },
                          );
                        }}
                      >
                        {row.commentsEnabled === false ? "Open comments" : "Close comments"}
                      </Button>
                      {isAdmin && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleting(row)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          {total > 0 ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${to} of ${total}` : ""}
          {isFetching && !isLoading && <IconLoader2 className="size-4 animate-spin" />}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <IconChevronLeft /> Previous
          </Button>
          <Button size="sm" variant="outline" disabled={to >= total} onClick={() => setPage((p) => p + 1)}>
            Next <IconChevronRight />
          </Button>
        </div>
      </div>

      {takingDown && <TakedownDialog row={takingDown} onClose={() => setTakingDown(null)} />}
      {deleting && <DeleteDialog row={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

function TakedownDialog({ row, onClose }: { row: ManagedArticle; onClose: () => void }) {
  const takeDown = useTakeDownArticle();
  const [reason, setReason] = useState("");
  const length = reason.trim().length;
  const confirm = () =>
    takeDown.mutate(
      { id: String(row._id), reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(`"${row.title}" has been taken down.`);
          onClose();
        },
        onError: (error) => toast.error(extractError(error, "Could not take the article down.")),
      },
    );
  return (
    <Dialog open onOpenChange={(open) => !open && !takeDown.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Take down "{row.title}"?</DialogTitle>
          <DialogDescription>
            Readers won't see it anymore. The writer keeps it, sees your reason, and can't republish it until a moderator
            restores it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <label htmlFor="takedown-reason" className="text-sm font-medium">
            Reason for the writer
          </label>
          <Textarea id="takedown-reason" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="e.g. Contains personal data of a third party." />
          <p className="text-xs text-muted-foreground">{length < 10 ? "At least 10 characters." : `${length}/500`}</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={takeDown.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={length < 10 || takeDown.isPending}>
            {takeDown.isPending && <IconLoader2 className="animate-spin" />}
            Take down
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ row, onClose }: { row: ManagedArticle; onClose: () => void }) {
  const remove = useDeleteManagedArticle();
  const confirm = () =>
    remove.mutate(String(row._id), {
      onSuccess: () => {
        toast.success(`"${row.title}" was deleted.`);
        onClose();
      },
      onError: (error) => toast.error(extractError(error, "Could not delete the article.")),
    });
  return (
    <Dialog open onOpenChange={(open) => !open && !remove.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{row.title}" permanently?</DialogTitle>
          <DialogDescription>
            This removes the article, its thumbnail and its images for good, including from its writer. Taking it down is
            usually enough.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={remove.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={remove.isPending}>
            {remove.isPending && <IconLoader2 className="animate-spin" />}
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
