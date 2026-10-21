export const blogPostsKey = {
  all: ["blogPosts"] as const,
  allMine: (userId: string) => [...blogPostsKey.all, userId] as const,
  mine: (userId: string, blogId: string) => [...blogPostsKey.allMine(userId), blogId] as const,
  detail: (id: string) => [...blogPostsKey.all, id] as const,
};
