import { useState } from "react";
import { href, Link } from "react-router";
import { IconCheck, IconClockHour4, IconPencilStar, IconSend, IconX, type Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestDialog } from "@/components/dashboard/become-writer-card";
import { useAuth } from "@/context/auth-store";
import { useMyWriterRequestHistory } from "@/features/writer-requests/api";
import { can, userRole } from "@/lib/permissions";

type Request = NonNullable<ReturnType<typeof useMyWriterRequestHistory>["data"]>[number];

const formatDate = (iso: string | Date) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const STATUS_BADGE = { pending: "outline", approved: "default", rejected: "destructive" } as const;
const STATUS_LABEL = { pending: "In review", approved: "Approved", rejected: "Not approved" } as const;

type Step = { title: string; detail: string; icon: Icon; state: "done" | "current" | "failed" | "upcoming" };

/** Submitted → In review → Decision, for one request. */
const stepsFor = (r: Request): Step[] => {
  const decided = r.status !== "pending";
  return [
    { title: "Submitted", detail: formatDate(r.createdAt), icon: IconSend, state: "done" },
    {
      title: "In review",
      detail: decided ? "Reviewed by an administrator" : "An administrator will look at it soon",
      icon: IconClockHour4,
      state: decided ? "done" : "current",
    },
    r.status === "approved"
      ? { title: "Approved", detail: formatDate(r.reviewedAt!), icon: IconCheck, state: "done" }
      : r.status === "rejected"
        ? { title: "Not approved", detail: formatDate(r.reviewedAt!), icon: IconX, state: "failed" }
        : { title: "Decision", detail: "Waiting for review", icon: IconCheck, state: "upcoming" },
  ];
};

const stepDot = {
  done: "bg-primary text-primary-foreground",
  current: "bg-primary/15 text-primary ring-2 ring-primary",
  failed: "bg-destructive text-white",
  upcoming: "bg-muted text-muted-foreground",
};

function Tracker({ request }: { request: Request }) {
  const steps = stepsFor(request);
  return (
    <ol className="grid gap-6 sm:grid-cols-3" aria-label="Request progress">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-3 sm:flex-col">
          {/* connector to the next step */}
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={`absolute top-4 left-4 hidden h-0.5 w-full sm:block ${steps[i + 1].state === "upcoming" ? "bg-border" : "bg-primary"}`}
            />
          )}
          <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${stepDot[step.state]}`}>
            <step.icon className="size-4" />
          </span>
          <span>
            <span className="block font-medium">
              {step.title}
              {step.state === "current" && <span className="sr-only"> (current step)</span>}
            </span>
            <span className="block text-sm text-muted-foreground">{step.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function DashboardWriterAccess() {
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useMyWriterRequestHistory();
  const [open, setOpen] = useState(false);
  const [latest, ...earlier] = requests;
  const isWriter = can(user?.user, "WRITE");
  const canApply = !isWriter && userRole(user?.user)?.name === "User" && latest?.status !== "pending";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-bold">Writer access</h1>
        <p className="text-muted-foreground">Track your request to publish on Inkwell.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !latest ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <IconPencilStar className="size-8 text-primary" />
            <p className="font-medium">{isWriter ? "You already have writer access." : "You haven't requested writer access yet."}</p>
            {canApply && <Button onClick={() => setOpen(true)}>Request writer access</Button>}
            {isWriter && (
              <Button asChild>
                <Link to={href("/dashboard/articles/new")}>Write an article</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Current request</CardTitle>
            <Badge variant={STATUS_BADGE[latest.status]}>{STATUS_LABEL[latest.status]}</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tracker request={latest} />

            {latest.reviewNote && (
              <div className={`rounded-md border p-3 text-sm ${latest.status === "rejected" ? "border-destructive/30 bg-destructive/5" : "bg-muted/40"}`}>
                <p className="font-medium">Note from the administrator</p>
                <p className="mt-1 text-muted-foreground">"{latest.reviewNote}"</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium">What you sent</p>
              <blockquote className="border-l-2 pl-3 text-sm whitespace-pre-line text-muted-foreground">
                {latest.message}
              </blockquote>
            </div>

            <div className="flex flex-wrap gap-2">
              {latest.status === "approved" && isWriter && (
                <Button asChild>
                  <Link to={href("/dashboard/articles/new")}>Write your first article</Link>
                </Button>
              )}
              {canApply && <Button onClick={() => setOpen(true)}>Apply again</Button>}
            </div>
          </CardContent>
        </Card>
      )}

      {earlier.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Earlier requests</h2>
          <ul className="divide-y rounded-lg border">
            {earlier.map((r) => (
              <li key={String(r._id)} className="space-y-1 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Sent {formatDate(r.createdAt)}</span>
                  <Badge variant={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </div>
                <p className="line-clamp-2">{r.message}</p>
                {r.reviewNote && <p className="text-muted-foreground">Note: "{r.reviewNote}"</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {open && <RequestDialog onClose={() => setOpen(false)} />}
    </div>
  );
}
