import { DevToolsAdapter } from '@forinda/kickjs-devtools'
import { MongooseAdapter } from './mongoose.adapter'
import { getEnv, KickCronAdapter } from '@forinda/kickjs'
import { SwaggerAdapter } from '@forinda/kickjs-swagger'
import { storageAdapter } from './storage'

export const appAdapters = [
  DevToolsAdapter({
    secret: false,
  }),
  MongooseAdapter({
    dbUri: getEnv('MONGO_URI'),
  }),
  SwaggerAdapter({ info: { title: 'Task App', version: '0.0.1' }, publicFlag: 'auth.public' }),
  // Files on disk under uploads/ until S3_BUCKET is set. Inject with @Inject(STORAGE).
  storageAdapter(),
  // Runs @Cron jobs (e.g. the daily article-image sweep) on the Node server.
  KickCronAdapter(),
]
