import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'

/**
 * Likes and bookmarks: one row per user, article and kind. The unique index makes
 * "like" idempotent under double-clicks and concurrent requests.
 */
export const reactionKinds = ['like', 'bookmark'] as const

export const reactionSchema = new Schema(
  {
    kind: { type: String, enum: reactionKinds, required: true },
    article: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

reactionSchema.index({ user: 1, article: 1, kind: 1 }, { unique: true })
reactionSchema.index({ article: 1, kind: 1 })

export type ReactionType = InferSchemaType<typeof reactionSchema>

export const getReactionModel = (conn: MongooseType) => {
  return <Model<ReactionType>>(conn.models.Reaction || conn.model<ReactionType>('Reaction', reactionSchema))
}
