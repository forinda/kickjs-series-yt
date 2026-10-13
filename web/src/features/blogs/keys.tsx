export const blogPostsKey = {
  all: ["blogPosts"] as const,
  mine: () => [...blogPostsKey.all] as const,
};
