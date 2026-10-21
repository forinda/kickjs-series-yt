import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { href, Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { IconAlertTriangle, IconArrowLeft, IconLoader2, IconPhotoUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/rich-text-editor";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { useAuth } from "@/context/auth-context";
import { useMyBlog } from "@/features/blogs/queries";
import { useCreateBlog, useUpdateBlog, useUploadThumbnail } from "@/features/blogs/mutations";
import { blogFormResolver, writerStatuses, type BlogFormInput } from "@/features/blogs/schema";
import { searchCategories } from "@/features/categories/queries";
import { extractError } from "@/lib/api";

const STATUS_LABELS: Record<BlogFormInput["status"], { label: string; description: string }> = {
  draft: { label: "Draft", description: "Only you can see it" },
  "in-review": { label: "In review", description: "Waiting for a moderator" },
  published: { label: "Published", description: "Visible to everyone" },
  archived: { label: "Archived", description: "Hidden from readers, kept for you" },
};

const DEFAULT_VALUES: BlogFormInput = { title: "", category: "", body: "", status: "draft" };

// Populated refs come back as objects; unpopulated ones as id strings.
const refId = (ref: unknown) =>
  typeof ref === "object" && ref !== null ? (ref as { _id: string })._id : String(ref ?? "");

export default function DashboardPostEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: post, isLoading } = useMyBlog(user?.user._id ?? "", id ?? "");
  const createPost = useCreateBlog();
  const updatePost = useUpdateBlog();
  const uploadThumbnail = useUploadThumbnail();
  const [file, setFile] = useState<File | null>(null);

  const takedown = (post?.takedown ?? null) as { at: string; reason: string } | null;

  // The article's current category, so the picker shows its name before any search runs.
  const savedCategory =
    post && typeof post.category === "object" && post.category
      ? { value: refId(post.category), label: (post.category as { name: string }).name }
      : null;

  const form = useForm<BlogFormInput>({ resolver: blogFormResolver, defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        body: post.body,
        status: post.status,
        category: refId(post.category),
      });
    }
  }, [post, form]);

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : (post?.thumbnail ?? null)),
    [file, post],
  );
  useEffect(() => () => void (file && preview && URL.revokeObjectURL(preview)), [file, preview]);

  const isSaving = createPost.isPending || updatePost.isPending || uploadThumbnail.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      let postId = id;
      if (postId) await updatePost.mutateAsync({ id: postId, ...values });
      else postId = (await createPost.mutateAsync(values))._id;
      if (file) await uploadThumbnail.mutateAsync({ id: postId, file });
      toast.success(isEdit ? "Article updated." : "Article created.");
      navigate(href("/dashboard/articles"));
    } catch (error) {
      toast.error(extractError(error, "Could not save the article. Please try again."));
    }
  });

  if (isEdit && isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96" />
      </div>
    );
  }
  if (isEdit && !post) {
    return <p className="p-4 text-muted-foreground">Article not found.</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="mx-auto max-w-5xl space-y-6 p-2 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to={href("/dashboard/articles")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <IconArrowLeft className="size-4" /> Articles
            </Link>
            <h1 className="text-2xl font-bold">{isEdit ? "Edit article" : "New article"}</h1>
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <IconLoader2 className="animate-spin" />}
            {isSaving ? "Saving…" : "Save article"}
          </Button>
        </div>

        {takedown && (
          <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="space-y-1">
              <p className="font-medium">A moderator took this article down on {new Date(takedown.at).toLocaleDateString(undefined, { dateStyle: "medium" })}.</p>
              <p className="text-muted-foreground">"{takedown.reason}"</p>
              <p className="text-muted-foreground">
                You can keep editing it, but it can't be published again until a moderator restores it.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Designing multi-tenant SaaS" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="body"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      invalid={!!fieldState.error}
                      placeholder="Start writing your article…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <aside className="space-y-5">
            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Combobox
                      required
                      value={field.value}
                      onChange={(v) => v && field.onChange(v)}
                      // While taken down, publishing is locked until a moderator restores it.
                      items={[...new Set([...writerStatuses, field.value])]
                        .filter((status) => !(takedown && status === "published"))
                        .map((status) => ({
                        value: status,
                        label: STATUS_LABELS[status].label,
                        description: STATUS_LABELS[status].description,
                      }))}
                      searchPlaceholder="Search statuses…"
                      triggerClassName="h-10!"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="category"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Combobox
                      required
                      value={field.value || null}
                      onChange={(v) => v && field.onChange(v)}
                      onSearch={searchCategories}
                      selectedItems={savedCategory ? [savedCategory] : undefined}
                      placeholder="Select a category"
                      searchPlaceholder="Search categories…"
                      emptyMessage="No categories yet. Ask an admin to add one."
                      triggerClassName="h-10!"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <span className="text-sm font-medium">Thumbnail</span>
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed bg-muted/40 text-sm text-muted-foreground hover:bg-muted">
                {preview ? (
                  <img src={preview} alt="Thumbnail preview" className="size-full object-cover" />
                ) : (
                  <>
                    <IconPhotoUp className="size-6" />
                    Choose an image (max 5 MB)
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {preview && (
                <p className="text-xs text-muted-foreground">Click the image to replace it.</p>
              )}
            </div>
          </aside>
        </div>
      </form>
    </Form>
  );
}
