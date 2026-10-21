import 'reflect-metadata'
// Side-effect import — registers the extended env schema with kickjs
// **before** any controller / service / @Value gets resolved. Without
// this line ConfigService.get('YOUR_KEY') returns undefined because the
// cached schema would still be the base shape. See guide/configuration.
import './config'
import { bootstrap, expressRuntime, requestLogger } from '@forinda/kickjs'
import { SpaAdapter } from '@forinda/kickjs/spa'
import { modules } from './modules'
import { appAdapters } from './adapters'
import { Auth } from './contributors/auth.contributor'
import express from 'express'
// Export the app for the Vite plugin (dev mode)
export const app = await bootstrap({
  modules,
  runtime: expressRuntime(),
  adapters: [
    ...appAdapters,
    SpaAdapter({ clientDir: '../web/dist' }),
  ],
  logRouteTable: false,
  contributors: [Auth.registration],
  health: {
    flags: ['auth.public'],
  },
  middlewares: [requestLogger(), express.json()],
})
