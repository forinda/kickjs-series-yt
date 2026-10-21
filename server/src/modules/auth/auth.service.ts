import { Service, Inject, HttpException, Autowired } from '@forinda/kickjs'
import type { AuthResponseDTO } from './dtos/auth-response.dto'
import type { RegisterAuthDTO } from './dtos/register-auth.dto'
import type { LoginAuthDTO } from './dtos/login-auth.dto'
import type { UpdateProfileDTO } from './dtos/update-profile.dto'
import { DB, type Db } from '@/db'
import { comparePassword, hashPassword } from '@/utils/password'
import { JWT, Jwt } from '@/utils/jwt'
import { Types } from 'mongoose'
import { UserSeeder } from '@/common/seeder/user-seeder'
import { AssignRoleDTO } from './dtos/assign-role.dto'
import { STORAGE, type Storage } from '@/adapters/storage'
import { randomBytes } from 'node:crypto'
import path from 'node:path'

// Avatars sit in the stored session, so sign them for the max (7 days); the UI falls back to initials if one expires.
export const AVATAR_URL_TTL = 604800

@Service()
export class AuthService {
  constructor(
    @Inject(DB) private readonly repo: Db,
    @Inject(JWT) private readonly jwt: Jwt,
    @Autowired() private readonly seeder: UserSeeder,
    @Inject(STORAGE) private readonly storage: Storage,
  ) {}

  /** Plain user object with `avatar` swapped from storage key to a signed URL. */
  private async present<T extends { avatar?: string | null }>(user: T) {
    return {
      ...user,
      avatar: user.avatar ? await this.storage.url(user.avatar, { expiresIn: AVATAR_URL_TTL }) : null,
    }
  }

  async me(id: string) {
    const user = await this.repo.User.findById(id).select('-password').populate('role', { name: 1 })
    return user ? this.present(user.toObject()) : null
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
    const { password, ...userWithoutPassword } = user.toObject()
    const match = await comparePassword(dto.password!, password)
    if (!match) {
      throw HttpException.badRequest('Invalid email or password')
    }
    const session = await this.createUserSession({
      _id: userWithoutPassword._id,
      name: userWithoutPassword.name,
    })
    return { user: await this.present(userWithoutPassword), jwt: session }
  }

  async update(id: string, dto: UpdateProfileDTO) {
    const user = await this.repo.User.findByIdAndUpdate(id, { $set: dto }, { new: true })
      .select('-password')
      .populate('role', { name: 1 })
    if (!user) {
      throw HttpException.notFound('User not found')
    }
    return this.present(user.toObject())
  }

  async uploadAvatar(id: string, file: { buffer: Buffer; originalname: string; mimetype: string }) {
    const key = `avatars/${id}/${randomBytes(8).toString('hex')}${path.extname(file.originalname)}`
    await this.storage.put(key, file.buffer, { contentType: file.mimetype })
    return this.replaceAvatar(id, key)
  }

  removeAvatar(id: string) {
    return this.replaceAvatar(id, null)
  }

  private async replaceAvatar(id: string, key: string | null) {
    const previous = await this.repo.User.findByIdAndUpdate(id, { $set: { avatar: key } })
    if (!previous) {
      if (key) await this.storage.delete(key).catch(() => {})
      throw HttpException.notFound('User not found')
    }
    // Old file is unreachable once replaced; don't let cleanup failure fail the request.
    if (previous.avatar) await this.storage.delete(previous.avatar).catch(() => {})
    return (await this.me(id))!
  }

  async delete(id: string): Promise<void> {
    await this.repo.User.deleteOne({ _id: id })
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
