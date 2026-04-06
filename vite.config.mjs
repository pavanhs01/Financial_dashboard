import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

function devApiPlugin() {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next()
          return
        }

        const url = new URL(req.url, 'http://127.0.0.1')
        const route = url.pathname.replace(/^\/api\//, '')
        const filePath = path.resolve(process.cwd(), 'api', `${route}.js`)

        try {
          const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`)
          const handler = mod.default

          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Invalid API handler for /api/${route}` }))
            return
          }

          let rawBody = ''
          await new Promise((resolve, reject) => {
            req.on('data', (chunk) => {
              rawBody += chunk
            })
            req.on('end', resolve)
            req.on('error', reject)
          })

          req.query = Object.fromEntries(url.searchParams.entries())
          req.body = rawBody ? JSON.parse(rawBody) : {}

          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (payload) => {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json')
            }
            res.end(JSON.stringify(payload))
            return res
          }

          await handler(req, res)
        } catch (error) {
          if (error?.code === 'ENOENT') {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Unknown API route: ${url.pathname}` }))
            return
          }

          if (error instanceof SyntaxError) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid JSON request body' }))
            return
          }

          console.error('Local API route failed:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error?.message || 'Local API route failed' }))
        }
      })
    },
  }
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)
  const plugins = [react(), tailwindcss(), devApiPlugin()]
  try {
    const m = await import('./.vite-source-tags.js')
    plugins.push(m.sourceTags())
  } catch {}
  return { plugins }
})
