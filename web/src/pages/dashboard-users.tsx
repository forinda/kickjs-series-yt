import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IconChevronLeft, IconChevronRight, IconLoader2, IconSearch } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/context/auth-store";
import { useAssignRole, useRoles, useSetUserStatus, useUsers, type UserRow, type UsersFilter } from "@/features/users/api";
import { extractError } from "@/lib/api";
import { userRole } from "@/lib/permissions";
import { displayName, initials } from "@/lib/utils";

const PAGE_SIZE = 20;
const STATUS_ITEMS = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

/** Debounced copy of a value, so typing in search doesn't fire a request per keystroke. */
function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function DashboardUsers() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<"active" | "disabled" | null>(null);
  const [page, setPage] = useState(1);
  const q = useDebounced(search.trim());

  const filter: UsersFilter = {
    page,
    limit: PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };
  const { data, isLoading, isFetching } = useUsers(filter);
  const { data: roles = [] } = useRoles();
  const assignRole = useAssignRole();
  const [toDisable, setToDisable] = useState<UserRow | null>(null);

  const roleItems = roles.map((r) => ({ value: String(r._id), label: r.name, description: r.description }));
  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const changeRole = (row: UserRow, roleId: string | null) => {
    if (!roleId || roleId === userRole(row)?._id) return;
    assignRole.mutate(
      { id: String(row._id), roleId },
      {
        onSuccess: () => toast.success(`${displayName(row)} is now ${roles.find((r) => String(r._id) === roleId)?.name}.`),
        onError: (error) => toast.error(extractError(error, "Could not change the role.")),
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 md:p-4">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage roles and access for everyone on Inkwell.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // a new filter starts from the first page
            }}
            placeholder="Search by name or email…"
            aria-label="Search users"
            className="h-9 pl-9"
          />
        </div>
        <Combobox
          aria-label="Filter by role"
          value={role}
          onChange={(v) => {
            setRole(v);
            setPage(1);
          }}
          items={roleItems}
          placeholder="All roles"
          searchPlaceholder="Search roles…"
          className="w-44"
          triggerClassName="h-9!"
        />
        <Combobox
          aria-label="Filter by status"
          value={status}
          onChange={(v) => {
            setStatus(v as "active" | "disabled" | null);
            setPage(1);
          }}
          items={STATUS_ITEMS}
          placeholder="Any status"
          className="w-40"
          triggerClassName="h-9!"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-9" />
                  </td>
                </tr>
              ))}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No users match these filters.
                </td>
              </tr>
            )}
            {data?.items.map((row) => {
              const isMe = String(row._id) === me?.user._id;
              const disabled = !!row.disabled;
              return (
                <tr key={String(row._id)} className={disabled ? "bg-muted/30" : "hover:bg-muted/30"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={row.avatar ?? undefined} alt="" className="object-cover" />
                        <AvatarFallback>{initials(row)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {displayName(row)}
                          {isMe && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{row.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Combobox
                      required
                      aria-label={`Role for ${displayName(row)}`}
                      value={userRole(row)?._id ? String(userRole(row)!._id) : null}
                      onChange={(v) => changeRole(row, v)}
                      items={roleItems}
                      placeholder="No role"
                      disabled={isMe || assignRole.isPending}
                      className="w-40"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={disabled ? "destructive" : "secondary"}>{disabled ? "Disabled" : "Active"}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isMe && (disabled ? <EnableButton row={row} /> : (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setToDisable(row)}>
                        Disable
                      </Button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          {total > 0 ? `Showing ${from}–${to} of ${total}` : ""}
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

      {toDisable && <DisableDialog row={toDisable} onClose={() => setToDisable(null)} />}
    </div>
  );
}

function EnableButton({ row }: { row: UserRow }) {
  const setStatus = useSetUserStatus();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={setStatus.isPending}
      onClick={() =>
        setStatus.mutate(
          { id: String(row._id), disabled: false },
          {
            onSuccess: () => toast.success(`${displayName(row)} can sign in again.`),
            onError: (error) => toast.error(extractError(error, "Could not enable the account.")),
          },
        )
      }
    >
      Enable
    </Button>
  );
}

function DisableDialog({ row, onClose }: { row: UserRow; onClose: () => void }) {
  const setStatus = useSetUserStatus();
  const confirm = () =>
    setStatus.mutate(
      { id: String(row._id), disabled: true },
      {
        onSuccess: () => {
          toast.success(`${displayName(row)} has been disabled.`);
          onClose();
        },
        onError: (error) => toast.error(extractError(error, "Could not disable the account.")),
      },
    );

  return (
    <Dialog open onOpenChange={(open) => !open && !setStatus.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable {displayName(row)}?</DialogTitle>
          <DialogDescription>
            They'll be signed out straight away and won't be able to sign in until you enable the account
            again. Their articles stay as they are.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={setStatus.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={setStatus.isPending}>
            {setStatus.isPending && <IconLoader2 className="animate-spin" />}
            Disable account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
