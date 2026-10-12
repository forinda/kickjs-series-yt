import { DB, type Db } from '@/db'
import { UserType } from '@/db/models/user'
import { hashPassword } from '@/utils/password'
import { getEnv, Inject, Service, Value, Logger } from '@forinda/kickjs'

const baseUser: Pick<UserType, 'email' | 'name' | 'password'> = {
  name: 'Base User',
  email: getEnv('BASE_USER_EMAIL'),
  password: 'password123',
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
      logger.info('Initializing roles...')
      await this.db.Role.initialize()
      // Assign default role to the base user
      // 1st user is an administrator
      const adminRole = await this.db.Role.findOne({ name: 'Admin' })
      if (adminRole && existingUser) {
        logger.info(`Assigning Administrator role to user: ${existingUser.email}`)
        existingUser.role = adminRole._id
        //  adminRole
        await existingUser.save()
      }
    } catch (error) {
      logger.error('Failed to seed base user:', error)
    }
  }
}
