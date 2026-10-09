import { DevToolsAdapter } from '@forinda/kickjs-devtools'
import { MongooseAdapter } from './mongoose.adapter'
import { getEnv } from '@forinda/kickjs'
import { SwaggerAdapter } from '@forinda/kickjs-swagger'

export const appAdapters = [
  DevToolsAdapter({
    secret: false,
  }),
  MongooseAdapter({
    dbUri: getEnv('MONGO_URI'),
  }),
  SwaggerAdapter({ info: { title: 'Task App', version: '0.0.1' }, publicFlag: 'auth.public' }),
]
