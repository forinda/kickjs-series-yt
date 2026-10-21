import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconCake,
  IconCalendar,
  IconCamera,
  IconLoader2,
  IconMail,
  IconPencil,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useRemoveAvatar, useUpdateProfile, useUploadAvatar } from "@/features/auth/mutations";
import { useMyProfile } from "@/features/auth/queries";
import { PROFILE_LIMITS, profileResolver, type ProfileInput } from "@/features/auth/schema";
import { extractError } from "@/lib/api";
import { displayName, initials } from "@/lib/utils";

type Profile = NonNullable<ReturnType<typeof useMyProfile>["data"]>;

const socialFields: { key: keyof ProfileInput["socials"]; label: string; icon: Icon; placeholder: string }[] = [
  { key: "website", label: "Website", icon: IconWorld, placeholder: "https://yoursite.com" },
  { key: "x", label: "X (Twitter)", icon: IconBrandX, placeholder: "https://x.com/username" },
  { key: "github", label: "GitHub", icon: IconBrandGithub, placeholder: "https://github.com/username" },
  { key: "linkedin", label: "LinkedIn", icon: IconBrandLinkedin, placeholder: "https://linkedin.com/in/username" },
];

const today = new Date().toISOString().slice(0, 10);
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // mirrors the server's @FileUpload limit

// DOB is stored as UTC midnight; format in UTC so it never shifts a day.
const formatDate = (iso: string, timeZone?: string) =>
  new Date(iso).toLocaleDateString(undefined, { dateStyle: "long", timeZone });

const prettyUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const toFormValues = (p: Profile): ProfileInput => ({
  name: p.name,
  firstName: p.firstName ?? "",
  lastName: p.lastName ?? "",
  dob: p.dob?.slice(0, 10) ?? "",
  bio: p.bio ?? "",
  socials: {
    website: p.socials?.website ?? "",
    x: p.socials?.x ?? "",
    github: p.socials?.github ?? "",
    linkedin: p.socials?.linkedin ?? "",
  },
});

export default function AccountProfile() {
  const { data: profile, isLoading } = useMyProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-2 md:p-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const links = socialFields.filter(({ key }) => profile.socials?.[key]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-2 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">How you appear as an author on Inkwell.</p>
        </div>
        <Button onClick={() => setEditing(true)}>
          <IconPencil /> Edit profile
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row">
          <AvatarEditor profile={profile} />
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{displayName(profile)}</h2>
              {displayName(profile) !== profile.name && (
                <p className="text-sm text-muted-foreground">@{profile.name}</p>
              )}
            </div>
            {profile.bio ? (
              <p className="leading-relaxed whitespace-pre-line">{profile.bio}</p>
            ) : (
              <p className="text-muted-foreground italic">
                No bio yet.{" "}
                <button type="button" className="underline" onClick={() => setEditing(true)}>
                  Add one
                </button>{" "}
                so readers know who's writing.
              </p>
            )}
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <IconMail className="size-4" /> {profile.email}
              </li>
              {profile.dob && (
                <li className="flex items-center gap-2">
                  <IconCake className="size-4" /> Born {formatDate(profile.dob, "UTC")}
                  <span className="text-xs">(private)</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <IconCalendar className="size-4" /> Member since {formatDate(profile.createdAt)}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Social links</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {links.map(({ key, label, icon: SocialIcon }) => (
                <li key={key}>
                  <a
                    href={profile.socials![key]!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <SocialIcon className="size-5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">{label}</span>
                      <span className="block truncate text-sm font-medium">
                        {prettyUrl(profile.socials![key]!)}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No social links added yet.</p>
          )}
        </CardContent>
      </Card>

      <EditProfileSheet profile={profile} open={editing} onOpenChange={setEditing} />
    </div>
  );
}

function AvatarEditor({ profile }: { profile: Profile }) {
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const busy = uploadAvatar.isPending || removeAvatar.isPending;

  const onPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please choose an image file.");
    if (file.size > AVATAR_MAX_BYTES) return void toast.error("Image must be 2 MB or smaller.");
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success("Profile picture updated."),
      onError: (error) => toast.error(extractError(error, "Could not upload the picture.")),
    });
  };

  const onRemove = () =>
    removeAvatar.mutate(undefined, {
      onSuccess: () => toast.success("Profile picture removed."),
      onError: (error) => toast.error(extractError(error, "Could not remove the picture.")),
    });

  return (
    <div className="flex flex-col items-center gap-2 sm:w-40">
      <div className="relative">
        <Avatar className="size-24 text-2xl">
          <AvatarImage src={profile.avatar ?? undefined} alt="" className="object-cover" />
          <AvatarFallback>{initials(profile)}</AvatarFallback>
        </Avatar>
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <IconLoader2 className="size-6 animate-spin" />
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" disabled={busy} asChild>
          <label className="cursor-pointer">
            <IconCamera /> {profile.avatar ? "Change" : "Upload"}
            <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={onPicked} />
          </label>
        </Button>
        {profile.avatar && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={busy}
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">JPG, PNG or WebP, up to 2 MB.</p>
    </div>
  );
}

function EditProfileSheet({
  profile,
  open,
  onOpenChange,
}: {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useUpdateProfile();
  const form = useForm<ProfileInput>({
    resolver: profileResolver,
    defaultValues: toFormValues(profile),
    mode: "onTouched",
  });
  const bio = useWatch({ control: form.control, name: "bio" });

  // Every open starts from the saved profile, discarding abandoned edits.
  useEffect(() => {
    if (open) form.reset(toFormValues(profile));
  }, [open, profile, form]);

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated.");
        onOpenChange(false);
      },
      onError: (error) => toast.error(extractError(error, "Could not update your profile.")),
    }),
  );

  return (
    <Sheet open={open} onOpenChange={(next) => !save.isPending && onOpenChange(next)}>
      <SheetContent className="w-full! gap-0 p-0 sm:max-w-lg!">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-lg">Edit profile</SheetTitle>
          <SheetDescription>
            First and last name are optional. When both are empty, your account name is shown.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              <section className="space-y-5">
                <h3 className="text-sm font-medium text-muted-foreground">Personal details</h3>
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Account name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    name="firstName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="lastName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  name="dob"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" max={today} className="w-fit" />
                      </FormControl>
                      <FormDescription>Optional. Never shown publicly.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="bio"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Bio</FormLabel>
                        <span
                          className={`text-xs tabular-nums ${bio.trim().length > PROFILE_LIMITS.bio ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {bio.trim().length}/{PROFILE_LIMITS.bio}
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="A few words about you and what you write about."
                          className="min-h-28 resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-5">
                <h3 className="text-sm font-medium text-muted-foreground">Social links</h3>
                {socialFields.map(({ key, label, icon: SocialIcon, placeholder }) => (
                  <FormField
                    key={key}
                    name={`socials.${key}`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <SocialIcon className="size-4" /> {label}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder={placeholder} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </section>
            </div>

            <div className="flex justify-end gap-2 border-t bg-muted/40 px-6 py-4">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={save.isPending}>
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={!form.formState.isDirty || save.isPending}>
                {save.isPending && <IconLoader2 className="animate-spin" />}
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
