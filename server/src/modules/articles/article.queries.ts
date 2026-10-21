import { HttpException } from '@forinda/kickjs'
import type { Db } from '@/db'

/** Populate projections shared by article reads. */
export const AUTHOR_FIELDS = { id: 1, name: 1, firstName: 1, lastName: 1, avatar: 1 }
export const CATEGORY_FIELDS = { id: 1, name: 1, description: 1 }

/** An article the user wrote, or 404 (same answer whether it's missing or someone else's). */
export async function findOwnedArticle(db: Db, articleId: string, userId: string) {
  const article = await db.Blog.findOne({ _id: articleId, createdBy: userId })
  if (!article) throw HttpException.notFound('Article not found')
  return article
}

/** Writers may only file articles under categories they created. */
export async function assertCategoryUsable(db: Db, categoryId: string, userId: string) {
  if (!(await db.Category.exists({ _id: categoryId, createdBy: userId }))) {
    throw HttpException.notFound('Category not found')
  }
}
