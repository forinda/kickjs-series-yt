import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'
import { foreignKeys } from './fkeys'

export const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    todoId: { type: Schema.Types.ObjectId, ref: 'Todo', required: true },
    ...foreignKeys,
  },
  {
    timestamps: true,
  },
)

commentSchema.index({ content: 1 }, { unique: false })

export type CommentType = InferSchemaType<typeof commentSchema>

export const getCommentModel = (conn: MongooseType) => {
  return <Model<CommentType>>(
    (conn.models.Comment || conn.model<CommentType>('Comment', commentSchema))
  )
}
