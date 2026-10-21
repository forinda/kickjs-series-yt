import { useState } from "react";
import { href, Link } from "react-router";
import { toast } from "sonner";
import { IconClockHour4, IconInfoCircle, IconLoader2, IconPencilStar } from "@tabler/icons-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useMyWriterRequest, useSubmitWriterRequest } from "@/features/writer-requests/api";
import { extractError } from "@/lib/api";

const MIN = 30;
const MAX = 1000; // mirrors the server DTO

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });

const banner = "flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm";

/** For readers who can't write yet: a one-line call to action; the form lives in a dialog. */
export function BecomeWriterCard() {
  const { data: request, isLoading } = useMyWriterRequest();
  const [open, setOpen] = useState(false);

  if (isLoading) return null;

  if (request?.status === "pending") {
    return (
      <div className={`${banner} bg-muted/40`}>
        <IconClockHour4 className="size-5 shrink-0 text-primary" />
        <p className="flex-1">
          <span className="font-medium">Your writer request is under review.</span>{" "}
          <span className="text-muted-foreground">Sent {formatDate(request.createdAt)}.</span>
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link to={href("/dashboard/writer-access")}>Track request</Link>
        </Button>
      </div>
    );
  }

  const rejected = request?.status === "rejected";
  return (
    <>
      <div className={`${banner} ${rejected ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-primary/5"}`}>
        {rejected ? (
          <IconInfoCircle className="size-5 shrink-0 text-destructive" />
        ) : (
          <IconPencilStar className="size-5 shrink-0 text-primary" />
        )}
        <p className="min-w-0 flex-1">
          {rejected ? (
            <>
              <span className="font-medium">Your writer request wasn't approved.</span>{" "}
              <span className="text-muted-foreground">{request.reviewNote ? `"${request.reviewNote}"` : "You can apply again."}</span>
            </>
          ) : (
            <>
              <span className="font-medium">Want to write on Inkwell?</span>{" "}
              <span className="text-muted-foreground">Request writer access and an administrator will review it.</span>
            </>
          )}
        </p>
        {rejected && (
          <Button size="sm" variant="outline" asChild>
            <Link to={href("/dashboard/writer-access")}>View details</Link>
          </Button>
        )}
        <Button size="sm" onClick={() => setOpen(true)}>
          {rejected ? "Apply again" : "Request writer access"}
        </Button>
      </div>
      {open && <RequestDialog onClose={() => setOpen(false)} />}
    </>
  );
}

export function RequestDialog({ onClose }: { onClose: () => void }) {
  const submit = useSubmitWriterRequest();
  const [message, setMessage] = useState("");
  const length = message.trim().length;

  const send = () =>
    submit.mutate(message.trim(), {
      onSuccess: () => {
        toast.success("Request sent. An administrator will review it.");
        onClose();
      },
      onError: (error) => toast.error(extractError(error, "Could not send your request.")),
    });

  return (
    <Dialog open onOpenChange={(open) => !open && !submit.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request writer access</DialogTitle>
          <DialogDescription>
            Tell us what you'd like to write about and any experience or past work.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="writer-request-message" className="text-sm font-medium">
              Why do you want to write?
            </label>
            <span className={`text-xs tabular-nums ${length > MAX ? "text-destructive" : "text-muted-foreground"}`}>
              {length}/{MAX}
            </span>
          </div>
          <Textarea
            id="writer-request-message"
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I'd like to write about… I've previously written for…"
            className="min-h-32"
          />
          <p className="text-xs text-muted-foreground">
            {length < MIN ? `At least ${MIN} characters.` : "Links to your writing help."}
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={submit.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={send} disabled={length < MIN || length > MAX || submit.isPending}>
            {submit.isPending && <IconLoader2 className="animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
