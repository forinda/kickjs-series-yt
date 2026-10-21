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
    // Engagement counters, kept in step with Reaction/Comment rows via atomic $inc so lists
    // can show them without counting per article.
    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    // Moderators can close the comments on an article.
    commentsEnabled: { type: Boolean, default: true },
    // Set when a moderator takes the article down. While set, the writer can edit but not
    // republish; a moderator restoring it clears this.
    takedown: {
      type: new Schema(
        {
          by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          at: { type: Date, required: true },
          reason: { type: String, required: true, trim: true },
        },
        { _id: false },
      ),
      default: null,
    },
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
