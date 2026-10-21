import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'

export const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
    // Set by an admin. Disabled users can't sign in, and existing sessions stop working.
    disabled: { type: Boolean, default: false },
    // Optional profile details; `name` stays the fallback display name.
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dob: { type: Date, default: null },
    bio: { type: String, trim: true },
    // Storage key (not a URL); responses swap it for a signed URL.
    avatar: { type: String, default: null },
    socials: {
      website: { type: String, trim: true },
      x: { type: String, trim: true },
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  },
)

const createUserModel = (conn: MongooseType) => conn.model('User', userSchema)

export type UserModel = ReturnType<typeof createUserModel>
export type UserType = InferSchemaType<typeof userSchema>
export type UserDocument = ReturnType<Model<UserType>['hydrate']>

export const getUserModel = (conn: MongooseType): UserModel => {
  return <UserModel>(conn.models.User || createUserModel(conn))
}
