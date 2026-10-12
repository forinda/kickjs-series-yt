import { Service, Inject, HttpException, Autowired } from '@forinda/kickjs'
import type { AuthResponseDTO } from './dtos/auth-response.dto'
import type { RegisterAuthDTO } from './dtos/register-auth.dto'
import type { LoginAuthDTO } from './dtos/login-auth.dto'
import { DB, type Db } from '@/db'
import { hashPassword } from '@/utils/password'
import { JWT, Jwt } from '@/utils/jwt'
import { Types } from 'mongoose'
import { UserSeeder } from '@/common/seeder/user-seeder'
import { AssignRoleDTO } from './dtos/assign-role.dto'

@Service()
export class AuthService {
  constructor(
    @Inject(DB) private readonly repo: Db,
    @Inject(JWT) private readonly jwt: Jwt,
    @Autowired() private readonly seeder: UserSeeder,
  ) {}

  async me(id: string) {
    return await this.repo.User.findById(id).populate('role', { name: 1 })
  }

  async findAll(): Promise<AuthResponseDTO[]> {
    return this.repo.User.find()
  }

  async create(dto: RegisterAuthDTO) {
    const existingUser = await this.repo.User.findOne({ email: dto.email })
    if (existingUser) {
      throw HttpException.conflict('Email already in use')
    }
    const hashedPassword = await hashPassword(dto.password)
    const created = await this.repo.User.create({
      ...dto,
      password: hashedPassword,
    })
    const { password: _, ...user } = created.toObject()
    const session = await this.createUserSession({ _id: user._id, name: user.name })
    return { user, jwt: session }
  }

  async login(dto: LoginAuthDTO) {
    const user = await this.repo.User.findOne({ email: dto.email }).populate('role', {
      name: 1,
      permissions: 1,
    })
    if (!user) {
      throw HttpException.badRequest('Invalid email or password')
    }
    const { password: _, ...userWithoutPassword } = user.toObject()
    const session = await this.createUserSession({
      _id: userWithoutPassword._id,
      name: userWithoutPassword.name,
    })
    return { user: userWithoutPassword, jwt: session }
  }

  async update(id: string, dto: LoginAuthDTO) {
    return this.repo.User.updateOne({ id }, dto)
  }

  async delete(id: string): Promise<void> {
    await this.repo.User.deleteOne({ id })
  }

  private createUserSession(user: { _id: Types.ObjectId; name: string }) {
    return this.jwt.sign({ id: user._id.toString(), name: user.name })
  }

  async setup() {
    try {
      await this.seeder.seed()
    } catch (error) {
      console.error('Failed to setup base user:', error)
    }
  }

  async assignRole(dto: AssignRoleDTO) {
    const { roleId, userId } = dto
    const user = await this.repo.User.findById(userId)
    if (!user) {
      throw HttpException.notFound('User not found')
    }
    await this.repo.User.updateOne({ _id: userId }, { role: roleId })
  }
}
