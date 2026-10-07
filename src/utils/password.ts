import bcrypt from 'bcryptjs'

export const comparePassword = async function (plain: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plain, hashed)
}

export const hashPassword = async function (plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(plain, salt)
}
