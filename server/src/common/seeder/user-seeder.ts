import { DB, type Db } from '@/db'
import { UserType } from '@/db/models/user'
import { hashPassword } from '@/utils/password'
import { getEnv, Inject, Service, Value, Logger } from '@forinda/kickjs'

const baseUser: Pick<UserType, 'email' | 'name' > = {
  name: 'Base User',
  email: getEnv('BASE_USER_EMAIL'),
}

const logger = Logger.for('UserSeeder')
@Service()
export class UserSeeder {
  @Inject(DB) private readonly db!: Db
  @Value('BASE_USER_PASSWORD')
  private readonly baseUserPassword!: string

  async seed() {
    try {
      let existingUser = await this.db.User.findOne({ email: baseUser.email })
      if (!existingUser) {
        existingUser = await this.db.User.create({
          ...baseUser,
          password: await hashPassword(this.baseUserPassword),
        })
      }
      // Initilize roles
      logger.debug('Initializing roles...')
      await this.db.Role.initialize()
      // Assign default role to the base user
      // 1st user is an administrator
      const adminRole = await this.db.Role.findOne({ name: 'Admin' })
      if (adminRole && existingUser) {
        logger.debug(`Assigning Administrator role to user: ${existingUser.email}`)
        existingUser.role = adminRole._id
        await existingUser.save()
      }
      // Backfill: accounts created before default roles existed get the default one.
      const defaultRole = await this.db.Role.findOne({ isDefault: true })
      if (defaultRole) {
        const { modifiedCount } = await this.db.User.updateMany(
          { role: null },
          { $set: { role: defaultRole._id } },
        )
        if (modifiedCount) logger.debug(`Gave ${modifiedCount} user(s) the default role ${defaultRole.name}`)
      }
    } catch (error) {
      logger.error('Failed to seed base user:', error)
    }
  }
}
