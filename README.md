# fullstack

Fullstack KickJS workspace — typed end to end.

| Package   | What                                                       |
| --------- | ---------------------------------------------------------- |
| `server/` | KickJS API (decorators, DI, `kick dev` with typegen watch) |
| `web/`    | create-vite scaffold — unwired (see below)                 |

## Develop

```bash
pnpm install
pnpm dev            # server (kick dev) + web (vite), in parallel
```

Server: http://localhost:3000 · Web: http://localhost:5173.

## Wiring web/ to the API

`web/` is whatever create-vite scaffolded; nothing connects it to the API yet.
Four steps — typed client, `/api` dev proxy, route-map types, `src/api.ts`:

https://kickjs.app/guide/fullstack-frontend.html
