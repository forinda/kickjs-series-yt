import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'
import { foreignKeys } from './fkeys'

export const categorySchema = new Schema(
  {
    description: { type: String, required: true },
    ...foreignKeys,
  },
  {
    timestamps: true,
  },
)

export type CategoryType = InferSchemaType<typeof categorySchema>

export const getCategoryModel = (conn: MongooseType) => {
  return <Model<CategoryType>>(
    (conn.models.Category || conn.model<CategoryType>('Category', categorySchema))
  )
}
