import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { KickClientError } from "@forinda/kickjs-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { IconLoader2, IconPencil, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/features/categories/queries";
import {
  CATEGORY_LIMITS,
  categorySchema,
  useSaveCategory,
  type CategoryInput,
} from "@/features/categories/mutations";
import { extractError } from "@/lib/api";

type Editing = (CategoryInput & { id?: string }) | null;

export default function DashboardCategories() {
  const { data: categories, isLoading } = useCategories();
  // `?new` (from the dashboard quick action) opens the create dialog straight away.
  const [searchParams] = useSearchParams();
  const [editing, setEditing] = useState<Editing>(
    searchParams.has("new") ? { name: "", description: "" } : null,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Group your posts so readers can find them.</p>
        </div>
        <Button onClick={() => setEditing({ name: "", description: "" })}>
          <IconPlus /> New category
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td colSpan={3} className="px-4 py-3">
                  <Skeleton className="h-8" />
                </td>
              </tr>
            )}
            {!isLoading && !categories?.length && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  No categories yet.
                </td>
              </tr>
            )}
            {categories?.map((category) => (
              <tr key={category._id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium whitespace-nowrap">{category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{category.description}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${category.name}`}
                    onClick={() =>
                      setEditing({
                        id: category._id,
                        name: category.name,
                        description: category.description,
                      })
                    }
                  >
                    <IconPencil />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <CategoryDialog category={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const length = value.trim().length;
  return (
    <span
      className={`text-xs tabular-nums ${length > max ? "text-destructive" : "text-muted-foreground"}`}
    >
      {length}/{max}
    </span>
  );
}

function CategoryDialog({
  category,
  onClose,
}: {
  category: NonNullable<Editing>;
  onClose: () => void;
}) {
  const { id, ...defaultValues } = category;
  const save = useSaveCategory();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues,
    mode: "onTouched",
  });
  const [name, description] = useWatch({ control: form.control, name: ["name", "description"] });

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(
      { id, ...values },
      {
        onSuccess: () => {
          toast.success(id ? "Category updated." : "Category created.");
          onClose();
        },
        onError: (error) => {
          // Duplicate name belongs next to the field, not in a toast.
          if (error instanceof KickClientError && error.status === 409) {
            form.setError("name", { message: extractError(error) }, { shouldFocus: true });
            return;
          }
          toast.error(extractError(error, "Could not save the category."));
        },
      },
    ),
  );

  return (
    <Dialog open onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl tracking-tight">
            {id ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription>
            Categories group your articles and show up as filters on the blog.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} noValidate>
            <div className="space-y-6 px-6 py-6">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <CharCount value={field.value} max={CATEGORY_LIMITS.name} />
                    </div>
                    <FormControl>
                      <Input {...field} autoFocus placeholder="e.g. Web Development" className="h-10" />
                    </FormControl>
                    <FormDescription>Must be unique. Keep it short, 1–3 words.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>
                        Description <span className="text-destructive">*</span>
                      </FormLabel>
                      <CharCount value={field.value} max={CATEGORY_LIMITS.description} />
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What kind of articles belong here?"
                        className="min-h-24 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Preview
                </p>
                <Badge variant="secondary">{name.trim() || "Category name"}</Badge>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {description.trim() || "Your description will appear here."}
                </p>
              </div>
            </div>

            {/* Plain div: DialogFooter's built-in negative margins assume p-4 content. */}
            <div className="flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={save.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <IconLoader2 className="animate-spin" />}
                {id ? "Save changes" : "Create category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
