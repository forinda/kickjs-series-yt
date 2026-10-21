import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { hashPassword } from '@/utils/password'
import { verifyPassword } from '../account.queries'
import type { ChangePasswordDTO } from '../dtos/security.dto'

@Service()
export class ChangePasswordUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(userId: string, { currentPassword, newPassword }: ChangePasswordDTO) {
    const user = await verifyPassword(this.db, userId, currentPassword)
    user.password = await hashPassword(newPassword)
    await user.save()
  }
}
