import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";
import { KickClientError } from "@forinda/kickjs-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-store";
import { useChangePassword, useDeleteAccount } from "@/features/auth/mutations";
import { extractError } from "@/lib/api";

// Mirrors server/src/modules/account/dtos/security.dto.ts, plus the confirm field.
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current one",
  });
type PasswordInput = z.infer<typeof passwordSchema>;

export function SecuritySection() {
  const change = useChangePassword();
  const form = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(({ currentPassword, newPassword }) =>
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Password changed.");
        },
        onError: (error) => {
          // A wrong current password belongs next to that field.
          if (error instanceof KickClientError && error.status === 400) {
            form.setError("currentPassword", { message: extractError(error) }, { shouldFocus: true });
          } else toast.error(extractError(error, "Could not change your password."));
        },
      },
    ),
  );

  return (
    <Card className="gap-0">
      <CardHeader className="gap-1 border-b">
        <CardTitle className="text-base font-medium">Password</CardTitle>
        <CardDescription>Use 8 or more characters you don't use anywhere else.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate>
          <CardContent className="grid gap-5 py-6 sm:grid-cols-2">
            <FormField
              name="currentPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem className="sm:col-span-2 sm:max-w-sm">
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" autoComplete="current-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="newPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={change.isPending}>
              {change.isPending && <IconLoader2 className="animate-spin" />}
              Change password
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

const CONFIRM_PHRASE = "delete my account";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="gap-0 border-destructive/40">
      <CardHeader className="gap-1 border-b border-destructive/20">
        <CardTitle className="text-base font-medium text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently deletes your account, your articles (with their images, likes and comments), your comments and
          bookmarks. This can't be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end pt-6">
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </CardFooter>
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </Card>
  );
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const remove = useDeleteAccount();
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const ready = password.length > 0 && phrase.trim().toLowerCase() === CONFIRM_PHRASE;

  const confirm = () =>
    remove.mutate(password, {
      onSuccess: () => {
        // Leave the dashboard first (synchronously) so <Protect> doesn't redirect to sign-in.
        navigate("/", { flushSync: true });
        logout();
        toast.success("Your account has been deleted.");
      },
      onError: (error) => toast.error(extractError(error, "Could not delete your account.")),
    });

  return (
    <Dialog open onOpenChange={(o) => !o && !remove.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>Everything listed will be removed for good. Confirm with your password.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="delete-password" className="text-sm font-medium">
              Password
            </label>
            <Input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="delete-phrase" className="text-sm font-medium">
              Type <span className="font-mono">{CONFIRM_PHRASE}</span> to confirm
            </label>
            <Input id="delete-phrase" value={phrase} onChange={(e) => setPhrase(e.target.value)} autoComplete="off" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={remove.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={!ready || remove.isPending}>
            {remove.isPending && <IconLoader2 className="animate-spin" />}
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
