import { HttpException } from '@forinda/kickjs'
import type { Db } from '@/db'
import { comparePassword } from '@/utils/password'

/** The user, after proving they know their password (for sensitive account changes). */
export async function verifyPassword(db: Db, userId: string, password: string) {
  const user = await db.User.findById(userId)
  if (!user) throw HttpException.notFound('User not found')
  if (!(await comparePassword(password, user.password))) {
    // 400 (not 401): a wrong password here must not sign the user out.
    throw HttpException.badRequest('Your password is incorrect')
  }
  return user
}
