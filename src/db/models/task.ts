import { InferSchemaType, Model, Schema } from 'mongoose'
import { MongooseType } from '../types'
import { foreignKeys } from './fkeys'

export const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'in-progress', 'completed'],
    },
    dueDate: { type: Date, required: false },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    ...foreignKeys,
  },
  {
    timestamps: true,
  },
)

export type TaskType = InferSchemaType<typeof taskSchema>

export const getTaskModel = (conn: MongooseType) => {
  return <Model<TaskType>>(conn.models.Task || conn.model<TaskType>('Task', taskSchema))
}
