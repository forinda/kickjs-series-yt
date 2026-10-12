import { createToken } from '@forinda/kickjs'
import * as jose from 'jose'

export type JwtPayload = {
  id: string
  name: string
}

export class Jwt {
  private readonly issuer = 'task-app'
  private readonly audience = 'task-app'

  constructor(private readonly jwtSecret: string) {}

  private getSecretKey() {
    return new TextEncoder().encode(this.jwtSecret)
  }

  async sign(payload: JwtPayload) {
    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime('2h')
      .sign(this.getSecretKey())
  }

  async verify(token: string) {
    return jose.jwtVerify(token, this.getSecretKey(), {
      issuer: this.issuer,
      audience: this.audience,
    })
  }
}
export type JwtDecoded = jose.JWTVerifyResult<JwtPayload>

export const JWT = createToken<Jwt>('app/Jwt/auth')
