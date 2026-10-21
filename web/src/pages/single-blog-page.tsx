import { useParams } from "react-router";
import { useBlogPost } from "@/features/blogs/queries";
export default function SingleBlogPage() {
  const { id } = useParams();
  const { data: blog, error, isLoading } = useBlogPost(id!);
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading blog post</p>}
      {blog && (
        <div>
          <div>
            <img src={blog.thumbnail!} alt="" className="max-w-2xl object-contain" />
          </div>
          <h2>{blog.title}</h2>
          <p>{blog.body}</p>
        </div>
      )}
    </div>
  );
}
