import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconLoader2,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "@/features/auth/mutations";
import { useMyProfile } from "@/features/auth/queries";
import { PROFILE_LIMITS, profileResolver, type ProfileInput } from "@/features/auth/schema";
import { extractError } from "@/lib/api";
import { displayName, initials } from "@/lib/utils";

const EMPTY: ProfileInput = {
  name: "",
  firstName: "",
  lastName: "",
  dob: "",
  bio: "",
  socials: { website: "", x: "", github: "", linkedin: "" },
};

const socialFields: { key: keyof ProfileInput["socials"]; label: string; icon: Icon; placeholder: string }[] = [
  { key: "website", label: "Website", icon: IconWorld, placeholder: "https://yoursite.com" },
  { key: "x", label: "X (Twitter)", icon: IconBrandX, placeholder: "https://x.com/username" },
  { key: "github", label: "GitHub", icon: IconBrandGithub, placeholder: "https://github.com/username" },
  { key: "linkedin", label: "LinkedIn", icon: IconBrandLinkedin, placeholder: "https://linkedin.com/in/username" },
];

const today = new Date().toISOString().slice(0, 10);

export default function AccountProfile() {
  const { data: profile, isLoading } = useMyProfile();
  const save = useUpdateProfile();
  const form = useForm<ProfileInput>({ resolver: profileResolver, defaultValues: EMPTY, mode: "onTouched" });

  const toFormValues = (p: NonNullable<typeof profile>): ProfileInput => ({
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

  useEffect(() => {
    if (profile) form.reset(toFormValues(profile));
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- reset only when fresh data arrives
  }, [profile]);

  const [name, firstName, lastName, bio] = useWatch({
    control: form.control,
    name: ["name", "firstName", "lastName", "bio"],
  });
  const preview = { name, firstName, lastName };

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(values, {
      onSuccess: (user) => {
        form.reset(toFormValues(user));
        toast.success("Profile updated.");
      },
      onError: (error) => toast.error(extractError(error, "Could not update your profile.")),
    }),
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-2 md:p-4">
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="mx-auto max-w-3xl space-y-6 p-2 md:p-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">How you appear as an author on Inkwell.</p>
        </div>

        <Card className="gap-0">
          <CardHeader className="gap-1 border-b">
            <CardTitle className="text-base font-medium">Personal details</CardTitle>
            <CardDescription>
              First and last name are optional. When both are empty, your account name is shown.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 py-6 sm:flex-row">
            <div className="flex flex-col items-center gap-2 sm:w-40">
              <Avatar className="size-20 text-xl">
                <AvatarFallback>{initials(preview)}</AvatarFallback>
              </Avatar>
              <p className="text-center font-medium">{displayName(preview) || "Your name"}</p>
              <p className="text-center text-xs text-muted-foreground">{profile?.email}</p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
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
              <FormField
                name="dob"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" max={today} />
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
                  <FormItem className="sm:col-span-2">
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
                        className="min-h-24 resize-y"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="gap-1 border-b">
            <CardTitle className="text-base font-medium">Social links</CardTitle>
            <CardDescription>Optional. Use full links, e.g. https://github.com/you.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2">
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
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              disabled={!form.formState.isDirty || save.isPending}
              onClick={() => profile && form.reset(toFormValues(profile))}
            >
              Discard changes
            </Button>
            <Button type="submit" disabled={!form.formState.isDirty || save.isPending}>
              {save.isPending && <IconLoader2 className="animate-spin" />}
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
