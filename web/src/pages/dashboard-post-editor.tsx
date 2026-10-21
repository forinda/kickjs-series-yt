import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { href, Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { IconArrowLeft, IconLoader2, IconPhotoUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useMyBlog } from "@/features/blogs/queries";
import { useCreateBlog, useUpdateBlog, useUploadThumbnail } from "@/features/blogs/mutations";
import { blogFormResolver, blogPostStatuses, type BlogFormInput } from "@/features/blogs/schema";
import { useCategories } from "@/features/categories/queries";
import { extractError } from "@/lib/api";

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
  const { data: categories = [] } = useCategories();
  const createPost = useCreateBlog();
  const updatePost = useUpdateBlog();
  const uploadThumbnail = useUploadThumbnail();
  const [file, setFile] = useState<File | null>(null);

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

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Start writing… Leave a blank line between paragraphs."
                      className="min-h-[28rem] resize-y leading-relaxed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <aside className="space-y-6">
            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full capitalize">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {blogPostStatuses.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
