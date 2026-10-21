import { Autowired, Service } from '@forinda/kickjs'
import { UserSeeder } from '@/common/seeder/user-seeder'

/** Seeds roles and the base admin user. Idempotent. */
@Service()
export class SetupSystemUseCase {
  @Autowired() private readonly seeder!: UserSeeder

  execute() {
    return this.seeder.seed()
  }
}
