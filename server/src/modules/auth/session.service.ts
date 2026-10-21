import { Inject, Service } from '@forinda/kickjs'
import type { Types } from 'mongoose'
import { JWT, type Jwt } from '@/utils/jwt'

@Service()
export class SessionService {
  @Inject(JWT) private readonly jwt!: Jwt

  issue(user: { _id: Types.ObjectId; name: string }) {
    return this.jwt.sign({ id: user._id.toString(), name: user.name })
  }
}
