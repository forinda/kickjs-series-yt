import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'

export const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
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
