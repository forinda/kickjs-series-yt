import { DevToolsAdapter } from '@forinda/kickjs-devtools'
import { MongooseAdapter } from './mongoose.adapter'
import { getEnv } from '@forinda/kickjs'

export const appAdapters = [
  DevToolsAdapter({
    secret: false,
  }),
  MongooseAdapter({
    dbUri: getEnv('MONGO_URI'),
  }),
]
