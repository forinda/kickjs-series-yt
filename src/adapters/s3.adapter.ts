import { defineAdapter, type AdapterContext, createToken, Logger } from '@forinda/kickjs'
import { S3Client } from '@aws-sdk/client-s3'
import { randomBytes } from 'node:crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import path from 'node:path'

export interface S3AdapterConfig {
  accessKeyId?: string
  secretAccessKey?: string
  bucketName?: string
  region?: string
  endpoint?: string
}

const log = Logger.for('S3Adapter')

const buildUploader = (s3ClientInstance: S3Client, bucketName: string) => {
  return {
    async upload(file: Buffer, key: string, mimeType: string = 'application/octet-stream') {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3')
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
      })
      return s3ClientInstance.send(command)
    },
    async delete(key: string) {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
      return s3ClientInstance.send(command)
    },

    async getUrl(key: string) {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3')
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
      // const resp = await s3ClientInstance.send(command)
      return getSignedUrl(s3ClientInstance, command)
    },
    prepareKey(folder: string, originalName: string) {
      const fileExt = path.extname(originalName)
      let filename = `${randomBytes(8).toString('hex')}${fileExt}`
      return `${folder}/${filename}`
    },
  }
}

export type S3Uploader = ReturnType<typeof buildUploader>
export const S3Key = createToken<S3Uploader>('app/S3Uploader/app')

export const S3Adapter = defineAdapter<S3AdapterConfig>({
  name: 'S3Adapter',
  defaults: {
    region: 'us-east-1',
  },
  build: (_config, { name: _name }) => {
    return {
      beforeStart({ container }: AdapterContext): void {
        console.debug('Initializing S3 adapter with config:', _config)
        try {
          if (!_config.accessKeyId || !_config.secretAccessKey || !_config.bucketName) {
            throw new Error('Missing required S3 configuration')
          }
          const s3ClientInstance = new S3Client({
            credentials: {
              accessKeyId: _config.accessKeyId!,
              secretAccessKey: _config.secretAccessKey!,
            },
            region: _config.region,
            forcePathStyle: true,
            endpoint: _config.endpoint ?? `https://s3.${_config.region}.amazonaws.com`,
          })
          const uploader = buildUploader(s3ClientInstance, _config.bucketName!)
          container.registerInstance(S3Key, uploader)
        } catch (error) {
          log.error('Failed to initialize S3 uploader', error)
          throw error
        }
      },

      async onHealthCheck(): Promise<{ name: string; status: 'up' | 'down' }> {
        return { name: 's3', status: 'up' }
      },
    }
  },
})
