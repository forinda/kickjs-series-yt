import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'

/** A reader's comment on an article. Plain text; flat (no replies yet). */
export const commentSchema = new Schema(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

// The comments list for an article, oldest first.
commentSchema.index({ article: 1, createdAt: 1 })
commentSchema.index({ author: 1 })

export type CommentType = InferSchemaType<typeof commentSchema>

export const getCommentModel = (conn: MongooseType) => {
  return <Model<CommentType>>(conn.models.Comment || conn.model<CommentType>('Comment', commentSchema))
}
