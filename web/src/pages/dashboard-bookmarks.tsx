import { useState } from "react";
import { Link } from "react-router";
import { IconBookmark, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import BlogPostCard from "@/components/blog-post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogPostType } from "@/features/blogs/queries";
import { useBookmarks } from "@/features/engagement/api";

const PAGE_SIZE = 12; // matches the hook

export default function DashboardBookmarks() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBookmarks(page);
  const total = data?.total ?? 0;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <p className="text-muted-foreground">Articles you saved to read later.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="aspect-video" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-14 text-center">
          <IconBookmark className="size-8 text-muted-foreground" />
          <p className="font-medium">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground">Use "Save" on any article to keep it here.</p>
          <Button asChild variant="outline">
            <Link to="/">Browse articles</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((post) => (
            <BlogPostCard key={String(post._id)} post={post as unknown as BlogPostType} />
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{`Showing ${(page - 1) * PAGE_SIZE + 1}–${to} of ${total}`}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <IconChevronLeft /> Previous
            </Button>
            <Button size="sm" variant="outline" disabled={to >= total} onClick={() => setPage((p) => p + 1)}>
              Next <IconChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
