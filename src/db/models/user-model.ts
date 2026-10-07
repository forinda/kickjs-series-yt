import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'

export const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

userSchema.index({ email: 1 }, { unique: true })

export type UserType = InferSchemaType<typeof userSchema>

export const getUserModel = (conn: MongooseType) => {
  return <Model<UserType>>(conn.models.User || conn.model<UserType>('User', userSchema))
}
