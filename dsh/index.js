// DeepSeek Harness (dsh) host half of the whale-maid mascot plugin.
// The browser half (dsh/client.js) fetches the character PNGs from here,
// so the images live in the package and the client bundle stays tiny.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const name = 'whale-maid-mascot'
export const inject = []

const ASSETS = [
  { route: '/whale-maid-mascot/a.png', file: new URL('../assets/mascot_a.png', import.meta.url) },
  { route: '/whale-maid-mascot/b.png', file: new URL('../assets/mascot_b.png', import.meta.url) },
  { route: '/whale-maid-mascot/c.png', file: new URL('../assets/mascot_c.png', import.meta.url) },
]

export function apply(ctx, config = {}) {
  if (typeof ctx.inject !== 'function') return
  ctx.inject(['webServer'], (scope) => {
    try {
      for (const asset of ASSETS) {
        const path = fileURLToPath(asset.file)
        scope.webServer.register({
          name: `whale-maid-mascot-${asset.route.split('/').pop()}`,
          kind: 'exact',
          path: asset.route,
          handler: (req, res) => {
            if (req.method !== 'GET') {
              res.writeHead(405).end()
              return
            }
            try {
              const bytes = readFileSync(path)
              res.writeHead(200, {
                'content-type': 'image/png',
                'content-length': String(bytes.length),
                'cache-control': 'public, max-age=3600',
              })
              res.end(bytes)
            } catch (error) {
              res.writeHead(500, { 'content-type': 'text/plain' })
              res.end(String(error?.message ?? error))
            }
          },
        })
      }
    } catch (error) {
      console.error(`[whale-maid-mascot] asset routes skipped: ${error}`)
    }
  })
}
