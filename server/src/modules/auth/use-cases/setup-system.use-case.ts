import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import type { Types } from 'mongoose'
import { DB, type Db } from '@/db'
import { systemRoles } from '@/common/permissions/permissions'
import { UserSeeder } from '@/common/seeder/user-seeder'

/**
 * Seeds roles and the base admin user, and runs data backfills. Idempotent.
 *
 * `bootstrap` is the unauthenticated first-run path: it only works while no admin exists,
 * so a fresh install can be set up but a live one can't be poked by strangers.
 * `sync` is the same work for a signed-in admin (re-sync roles after a code change).
 */
@Service()
export class SetupSystemUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly seeder!: UserSeeder

  async bootstrap() {
    const adminRole = await this.db.Role.findOne({ name: systemRoles.ADMIN.name }, { _id: 1 })
      .lean<{ _id: Types.ObjectId }>()
    if (adminRole && (await this.db.User.exists({ role: adminRole._id }))) {
      throw HttpException.forbidden('Already set up. An admin can re-sync from POST /system/sync.')
    }
    await this.seeder.seed()
  }

  sync() {
    return this.seeder.seed()
  }
}
