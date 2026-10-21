import { createToken } from '@forinda/kickjs'
import { MongooseType } from './types'

export const mountMongooseModels = async (conn: MongooseType) => {
  const { getUserModel } = await import('./models/user')
  const { getBlogModel } = await import('./models/blog')
  const { getCategoryModel } = await import('./models/category')
  const { getCommentModel } = await import('./models/comment')
  const { getRoleModel } = await import('./models/role')
  const { getWriterRequestModel } = await import('./models/writer-request')
  const { getReactionModel } = await import('./models/reaction')
  return {
    User: getUserModel(conn),
    Blog: getBlogModel(conn),
    Category: getCategoryModel(conn),
    Comment: getCommentModel(conn),
    Role: getRoleModel(conn),
    WriterRequest: getWriterRequestModel(conn),
    Reaction: getReactionModel(conn),
  }
}

export type Db = Awaited<ReturnType<typeof mountMongooseModels>>
export const DB = createToken<Db>('db/App/Mongoose')
