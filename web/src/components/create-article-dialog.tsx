import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { createBlogResolver } from "@/features/blogs/schema";
import { useCategories } from "@/features/categories/queries";
import { useCreateBlog } from "@/features/blogs/mutations";
import { extractError } from "@/lib/api";
import { IconLoader2, IconPencil } from "@tabler/icons-react";

type Props = {
  isOpen: boolean;
  toggleModal: (state: boolean) => void;
};

const DEFAULT_VALUES = { title: "", category: "", body: "" };

export default function CreateArticleDialog({ isOpen, toggleModal }: Props) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createPost = useCreateBlog();

  const form = useForm({
    resolver: createBlogResolver,
    defaultValues: DEFAULT_VALUES,
  });

  // Start fresh every time the dialog closes
  useEffect(() => {
    if (!isOpen) form.reset(DEFAULT_VALUES);
  }, [isOpen, form]);

  const handleSubmit = form.handleSubmit((data) => {
    createPost.mutate(data, {
      onSuccess: () => {
        toggleModal(false);
        toast.success("Article created successfully.");
      },
      onError: (error) => {
        toast.error(extractError(error, "Could not create article. Please try again."));
      },
    });
  });

  const isSubmitting = createPost.isPending;
  const bodyLength = useWatch({ control: form.control, name: "body" })?.length ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && toggleModal(open)}>
      <DialogTrigger asChild>
        <Button>
          <IconPencil className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl tracking-tight">Create a new article</DialogTitle>
          <DialogDescription>
            Give your article a title, pick a category and write your story.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-6 sm:grid-cols-[1fr_220px]">
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Designing multi-tenant SaaS"
                          className="h-10"
                          autoFocus
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={categoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue
                              placeholder={categoriesLoading ? "Loading…" : "Select a category"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {categories.length === 0 ? (
                              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                No categories yet
                              </div>
                            ) : (
                              categories.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
                                  {item.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="body"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Body</FormLabel>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {bodyLength.toLocaleString()} characters
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Start writing your article…"
                        className="min-h-65 resize-y leading-relaxed"
                      />
                    </FormControl>
                    <FormDescription>Write the full content of your article.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 border-t bg-muted/40 px-6 py-4 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="sm:ml-2">
                {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Publishing…" : "Create Article"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
