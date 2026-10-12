import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'
import { foreignKeys } from './fkeys'
export const blogPostStatuses = ['draft', 'in-review', 'published', 'archived'] as const

export const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    thumbnail: { type: String, required: false },
    status: {
      type: String,
      required: true,
      default: 'draft',
      enum: blogPostStatuses,
    },
    publishedAt: { type: Date, required: false },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    ...foreignKeys,
  },
  {
    timestamps: true,
  },
)

export type BlogType = InferSchemaType<typeof blogSchema>

export const getBlogModel = (conn: MongooseType) => {
  return <Model<BlogType>>(conn.models.Blog || conn.model<BlogType>('Blog', blogSchema))
}
