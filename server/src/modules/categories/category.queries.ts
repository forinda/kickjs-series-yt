import { HttpException } from '@forinda/kickjs'
import type { Db } from '@/db'

/** Names are unique case-insensitively ("Web Dev" == "web dev"). */
export async function assertCategoryNameAvailable(db: Db, name: string, exceptId?: string) {
  const taken = await db.Category.findOne({ name, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })
    .collation({ locale: 'en', strength: 2 })
  if (taken) throw HttpException.conflict(`A category named "${name}" already exists`)
}
