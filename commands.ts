import { KickCommandDefinition } from '@forinda/kickjs-cli'

export const kickCommands: KickCommandDefinition[] = [
  {
    name: 'test',
    description: 'Run tests with Vitest',
    steps: 'vitest run',
  },
  {
    name: 'lint',
    description: 'Lint with oxlint',
    steps: 'oxlint src/',
  },
  {
    name: 'format',
    description: 'Format code with oxfmt',
    steps: 'oxfmt src/',
  },
  {
    name: 'format:check',
    description: 'Check formatting without writing',
    steps: 'oxfmt --check src/',
  },
  {
    name: 'ci:check',
    description: 'Run typecheck + lint + format check',
    steps: ['kick typecheck', 'oxlint src/', 'oxfmt --check src/'],
    aliases: ['verify'],
  },
]
