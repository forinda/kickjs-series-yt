"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IconCamera, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

const notificationPrefs = [
  {
    id: "product-updates",
    title: "Product updates",
    description: "New features, improvements, and announcements.",
    defaultChecked: true,
  },
  {
    id: "security-alerts",
    title: "Security alerts",
    description: "Sign-ins from new devices and password changes.",
    defaultChecked: true,
  },
  {
    id: "billing-emails",
    title: "Billing emails",
    description: "Invoices, receipts, and payment reminders.",
    defaultChecked: false,
  },
  {
    id: "marketing-emails",
    title: "Marketing emails",
    description: "Tips, offers, and product surveys.",
    defaultChecked: false,
  },
];

const AccountProfile = () => {
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const saveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const updatePassword = () => {
    toast.success("Password updated successfully");
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      {/* ---------------- Profile ---------------- */}
      <Card className="gap-0">
        <CardHeader className="gap-1 border-b border-border">
          <CardTitle className="text-base font-medium">Profile</CardTitle>
          <CardDescription>
            Update your personal details and how others see you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 py-6 sm:flex-row">
          <div className="flex flex-col items-center gap-3 ">
            <Avatar className="size-20">
              <AvatarImage
                src="https://images.shadcnspace.com/assets/shadcn-dashboard/profile/user-1.webp"
                alt="Sunil Joshi"
              />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Button  className="gap-1.5">
                <IconCamera className="size-3.5" />
                Change
              </Button>
              <Button variant="destructive">
                Remove
              </Button>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="fullname" className="text-sm font-normal text-foreground">
                Full name
              </FieldLabel>
              <Input id="fullname" defaultValue="Sunil Joshi" />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="username" className="text-sm font-normal text-foreground">
                Username
              </FieldLabel>
              <Input id="username" defaultValue="sunil.joshi" />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="email" className="text-sm font-normal text-foreground">
                Email
              </FieldLabel>
              <Input id="email" type="email" defaultValue="sunil.joshi@shadcndashboard.com" />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="phone" className="text-sm font-normal text-foreground">
                Phone
              </FieldLabel>
              <Input id="phone" type="tel" defaultValue="+1 (555) 012-3456" />
            </Field>
            <Field className="gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="bio" className="text-sm font-normal text-foreground">
                Bio
              </FieldLabel>
              <Input id="bio" defaultValue="Product designer based in Bengaluru." />
            </Field>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3  sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm ">Last updated: 17 Jan, 2026</p>
          <div className="flex items-center gap-3">
            <Button variant="destructive">Cancel</Button>
            <Button onClick={saveProfile}>Save changes</Button>
          </div>
        </CardFooter>
      </Card>

      {/* ---------------- Password & Security ---------------- */}
      <Card className="gap-0">
        <CardHeader className="gap-1 border-b border-border">
          <CardTitle className="text-base font-medium">Password & security</CardTitle>
          <CardDescription>Change your password and manage account access.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="current-password" className="text-sm font-normal text-foreground">
                Current password
              </FieldLabel>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </Field>
            <div className="hidden sm:block" />
            <Field className="gap-1.5">
              <FieldLabel htmlFor="new-password" className="text-sm font-normal text-foreground">
                New password
              </FieldLabel>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="confirm-password" className="text-sm font-normal text-foreground">
                Confirm new password
              </FieldLabel>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </Field>
          </div>

         

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Two-factor authentication
                </Label>
                <Badge variant="outline" className="text-xs font-normal">
                  Recommended
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch id="two-factor" className="cursor-pointer"/>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={updatePassword}>Update password</Button>
        </CardFooter>
      </Card>

      {/* ---------------- Notifications ---------------- */}
      <Card className="gap-0">
        <CardHeader className="gap-1 border-b border-border">
          <CardTitle className="text-base font-medium">Notifications</CardTitle>
          <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border py-2 px-0">
          {notificationPrefs.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between gap-4 py-4 px-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor={pref.id} className="text-sm font-medium text-foreground">
                  {pref.title}
                </Label>
                <p className="text-sm text-muted-foreground">{pref.description}</p>
              </div>
              <Switch id={pref.id} defaultChecked={pref.defaultChecked} className={"cursor-pointer"}/>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---------------- Danger Zone ---------------- */}
      <Card className="gap-0 ">
        <CardHeader className="gap-1 border-b border-destructive/40">
          <CardTitle className="text-base font-medium text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting your account removes all of your data permanently.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 py-6">
          <Field className="gap-2">
            <FieldLabel htmlFor="delete-confirm" className="text-sm font-normal text-foreground">
              Type <span className="font-medium text-foreground">delete my account</span> to confirm
            </FieldLabel>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="delete my account"
            />
          </Field>
        </CardContent>
        <CardFooter className="flex justify-end   ">
          <Button
            variant="destructive"
            disabled={deleteConfirm !== "delete my account"}
            className="gap-1.5"
            onClick={() => toast.success("Account deletion scheduled")}
          >
            <IconTrash className="size-3.5" />
            Delete account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountProfile;
