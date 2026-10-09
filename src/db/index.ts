import { createToken } from '@forinda/kickjs'
import { MongooseType } from './types'

export const mountMongooseModels = async (conn: MongooseType) => {
  const { getUserModel } = await import('./models/user-model')
  const { getTaskModel } = await import('./models/task')
  const { getCategoryModel } = await import('./models/category')
  const { getCommentModel } = await import('./models/comment')
  return {
    User: getUserModel(conn),
    Task: getTaskModel(conn),
    Category: getCategoryModel(conn),
    Comment: getCommentModel(conn),
  }
}

export type Db = Awaited<ReturnType<typeof mountMongooseModels>>
export const DB = createToken<Db>('db/App/Mongoose')
