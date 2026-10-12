import { DevToolsAdapter } from '@forinda/kickjs-devtools'
import { MongooseAdapter } from './mongoose.adapter'
import { getEnv } from '@forinda/kickjs'
import { SwaggerAdapter } from '@forinda/kickjs-swagger'
import { S3Adapter } from './s3.adapter'

export const appAdapters = [
  DevToolsAdapter({
    secret: false,
  }),
  MongooseAdapter({
    dbUri: getEnv('MONGO_URI'),
  }),
  SwaggerAdapter({ info: { title: 'Task App', version: '0.0.1' }, publicFlag: 'auth.public' }),
  S3Adapter({
    accessKeyId: getEnv('S3_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('S3_SECRET_ACCESS_KEY'),
    bucketName: getEnv('S3_BUCKET_NAME'),
    region: getEnv('S3_REGION'),
    endpoint: getEnv('S3_ENDPOINT'),
  }),
]
