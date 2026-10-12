import { DB } from '@/db'
import { MongooseType } from '@/db/types'
import {
  defineAdapter,
  type AdapterContext,
  IntrospectionSnapshot,
  Logger,
  ref,
} from '@forinda/kickjs'
import mongoose from 'mongoose'

const logger = Logger.for('MongooseAdapter')

export interface MongooseAdapterConfig {
  dbName?: string
  dbUri?: string
}

export const MongooseAdapter = defineAdapter<MongooseAdapterConfig>({
  name: 'MongooseAdapter',
  defaults: {
    dbName: 'task-app-db-yt',
    dbUri: 'mongodb://localhost:27017',
  },
  build: (_config, { name: _name }) => {
    let dbInstance: MongooseType | null = null
    const connected = ref(false)

    return {
      /**
       * Runs AFTER modules + routes are wired, BEFORE the server starts.
       * Right place for late-stage DI registrations or final config validation.
       *
       * Delete this hook if there's nothing to wire post-modules.
       */
      async beforeStart(_ctx: AdapterContext) {
        try {
          dbInstance = await mongoose.connect(_config.dbUri!, {
            dbName: _config.dbName,
          })

          connected.value = true
          const modelsConn = await import('@/db')
          const { mountMongooseModels } = modelsConn
          const dbModels = await mountMongooseModels(dbInstance)
          _ctx.container.registerInstance(DB, dbModels)
        } catch (error: any) {
          logger.error('Failed to connect to MongoDB:', error.message)
        }
      },

      async shutdown(): Promise<void> {
        if (dbInstance) {
          await dbInstance.disconnect()
          dbInstance = null
          connected.value = false
        }
      },

      async onHealthCheck(): Promise<{ name: string; status: 'up' | 'down' }> {
        // Example:
        try {
          if (!dbInstance || dbInstance!.connection?.readyState !== 1) {
            return { name: 'mongoose', status: 'down' }
          }
          return { name: 'mongoose', status: 'up' }
        } catch {
          logger.error('Error during health check for MongoDB')
          return { name: 'mongoose', status: 'down' }
        }
        // return { name: 'mongoose', status: 'up' }
      },

      /**
       * Snapshot for the DevTools topology view (`/_debug`).
       *
       * Must be CHEAP — the topology endpoint polls on a short interval, so
       * `state` and `metrics` should be counters and flags already in memory,
       * never a database round trip.
       *
       * Uncomment with: import type { IntrospectionSnapshot } from '@forinda/kickjs'
       * Delete this hook if the adapter has nothing worth showing.
       */
      introspect(): IntrospectionSnapshot {
        return {
          protocolVersion: 1,
          name: 'mongoose',
          kind: 'adapter',
          state: { connected: connected.value },
          metrics: { handled: 0 },
          tokens: { provides: [], requires: [] },
        }
      },
    }
  },
})
