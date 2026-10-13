import { defineConfig } from '@forinda/kickjs-cli'
import { kickCommands } from './commands'

export default defineConfig({
  pattern: 'minimal',
  runtime: 'express',
  packageManager: 'pnpm',
  modules: {
    dir: 'src/modules',
    repo: {
      name:'mongoose'
    },
    pluralize: false,
  },
  typegen: {
    schemaValidator: 'kickjs-schema',
    client:{
      enabled: true
    }
  },

  commands: kickCommands
})
