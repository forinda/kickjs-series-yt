import { useState } from "react";
import { toast } from "sonner";
import { IconCheck, IconChevronLeft, IconChevronRight, IconLoader2, IconX } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useReviewWriterRequest,
  useWriterRequests,
  type WriterRequestRow,
  type WriterRequestStatus,
} from "@/features/writer-requests/api";
import { extractError } from "@/lib/api";
import { displayName, initials } from "@/lib/utils";

const PAGE_SIZE = 20;
const TABS: { value: WriterRequestStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];
const STATUS_BADGE = { pending: "outline", approved: "default", rejected: "destructive" } as const;

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });

export default function DashboardWriterRequests() {
  const [tab, setTab] = useState<WriterRequestStatus | "all">("pending");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useWriterRequests({
    page,
    limit: PAGE_SIZE,
    ...(tab === "all" ? {} : { status: tab }),
  });
  const review = useReviewWriterRequest();
  const [rejecting, setRejecting] = useState<WriterRequestRow | null>(null);

  const total = data?.total ?? 0;
  const to = Math.min(page * PAGE_SIZE, total);

  const approve = (row: WriterRequestRow) =>
    review.mutate(
      { id: String(row._id), decision: "approve" },
      {
        onSuccess: () => toast.success(`${displayName(row.user)} is now a Writer.`),
        onError: (error) => toast.error(extractError(error, "Could not approve the request.")),
      },
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-bold">Writer requests</h1>
        <p className="text-muted-foreground">Readers asking to publish on Inkwell. Approving makes them a Writer.</p>
      </div>

      <div role="tablist" aria-label="Request status" className="inline-flex rounded-lg border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={tab === t.value}
            onClick={() => {
              setTab(t.value);
              setPage(1);
            }}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors aria-selected:bg-background aria-selected:font-medium aria-selected:text-foreground aria-selected:shadow-sm"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36" />)}
        {!isLoading && data?.items.length === 0 && (
          <p className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
            {tab === "pending" ? "Nothing waiting for review." : "No requests here."}
          </p>
        )}
        {data?.items.map((row) => (
          <article key={String(row._id)} className="space-y-3 rounded-lg border p-4">
            <header className="flex flex-wrap items-center gap-3">
              <Avatar className="size-9">
                <AvatarImage src={row.user?.avatar ?? undefined} alt="" className="object-cover" />
                <AvatarFallback>{initials(row.user)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{row.user ? displayName(row.user) : "Deleted user"}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {String(row.user?.email ?? "")} · asked {formatDate(row.createdAt)}
                </div>
              </div>
              <Badge variant={STATUS_BADGE[row.status]} className="capitalize">
                {row.status}
              </Badge>
            </header>
            <p className="text-sm whitespace-pre-line">{row.message}</p>
            {row.status === "pending" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve(row)} disabled={review.isPending || !row.user}>
                  <IconCheck /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRejecting(row)} disabled={review.isPending}>
                  <IconX /> Reject
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {row.status === "approved" ? "Approved" : "Rejected"}
                {row.reviewedBy && typeof row.reviewedBy === "object" ? ` by ${displayName(row.reviewedBy)}` : ""}
                {row.reviewedAt ? ` on ${formatDate(row.reviewedAt)}` : ""}
                {row.reviewNote ? ` — "${row.reviewNote}"` : ""}
              </p>
            )}
          </article>
        ))}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            {`Showing ${(page - 1) * PAGE_SIZE + 1}–${to} of ${total}`}
            {isFetching && <IconLoader2 className="size-4 animate-spin" />}
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
      )}

      {rejecting && <RejectDialog row={rejecting} onClose={() => setRejecting(null)} />}
    </div>
  );
}

function RejectDialog({ row, onClose }: { row: WriterRequestRow; onClose: () => void }) {
  const review = useReviewWriterRequest();
  const [note, setNote] = useState("");
  const confirm = () =>
    review.mutate(
      { id: String(row._id), decision: "reject", note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Request rejected.");
          onClose();
        },
        onError: (error) => toast.error(extractError(error, "Could not reject the request.")),
      },
    );

  return (
    <Dialog open onOpenChange={(open) => !open && !review.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {row.user ? displayName(row.user) : "this"}'s request?</DialogTitle>
          <DialogDescription>They'll see your note and can apply again later.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <label htmlFor="reject-note" className="text-sm font-medium">
            Note for the applicant <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="reject-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="e.g. Please include links to some of your writing."
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={review.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={review.isPending}>
            {review.isPending && <IconLoader2 className="animate-spin" />}
            Reject request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
