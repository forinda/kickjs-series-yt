import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'

export const writerRequestStatuses = ['pending', 'approved', 'rejected'] as const

/** A user asking to become a Writer, and an admin's decision on it. */
export const writerRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    /** Why they want to write: topics, experience, links to past work. */
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: writerRequestStatuses, default: 'pending', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    /** Shown to the user, e.g. why a request was rejected. */
    reviewNote: { type: String, trim: true, default: null },
  },
  { timestamps: true },
)

// At most one open request per user, enforced by the database (not just a check-then-insert).
writerRequestSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } })

export type WriterRequestType = InferSchemaType<typeof writerRequestSchema>

export const getWriterRequestModel = (conn: MongooseType) => {
  return <Model<WriterRequestType>>(
    (conn.models.WriterRequest || conn.model<WriterRequestType>('WriterRequest', writerRequestSchema))
  )
}
