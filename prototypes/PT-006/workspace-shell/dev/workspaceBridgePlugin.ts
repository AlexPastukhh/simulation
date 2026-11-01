import type { Plugin, ViteDevServer, WebSocketClient } from 'vite'
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

type BridgeResponse = { requestId: string; status: string; [key: string]: unknown }
const MAX_BODY = 16_384
const TIMEOUT_MS = 5_000

const json = (res: ServerResponse, code: number, payload: unknown) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(payload))
}
const isLoopback = (ip: string | undefined) =>
  ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'

async function readBody(req: IncomingMessage): Promise<unknown> {
  let length = 0
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    length += chunk.length
    if (length > MAX_BODY) throw new Error('Request too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

export function workspaceBridgePlugin(): Plugin {
  return {
    name: 'pt006-workspace-bridge',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const directory = join(server.config.root, '.workspace-bridge')
      mkdirSync(directory, { recursive: true, mode: 0o700 })
      const secret = randomBytes(32).toString('hex')
      writeFileSync(join(directory, 'token'), secret + '\n', { mode: 0o600 })
      let active: WebSocketClient | null = null
      const pending = new Map<string, (value: BridgeResponse) => void>()
      const validClient = () => {
        if (active && !server.ws.clients.has(active)) active = null
        return active
      }
      server.ws.on('workspace-bridge:register', (_: unknown, client: WebSocketClient) => {
        if (!validClient()) active = client
        client.send('workspace-bridge:registration', {
          status: client === active ? 'active' : 'busy',
        })
      })
      server.ws.on('workspace-bridge:response', (raw: unknown, client: WebSocketClient) => {
        if (client !== active || !raw || typeof raw !== 'object') return
        const value = raw as BridgeResponse
        if (typeof value.requestId !== 'string') return
        const resolve = pending.get(value.requestId)
        if (resolve) { pending.delete(value.requestId); resolve(value) }
      })
      const request = async (operation: string, data: Record<string, unknown> = {}) => {
        const client = validClient()
        if (!client) return { status: 'unavailable', code: 'NO_TAB', message: 'Нет подключённой вкладки Workspace' }
        const requestId = randomUUID()
        return new Promise<BridgeResponse>(resolve => {
          const timer = setTimeout(() => {
            pending.delete(requestId)
            resolve({ requestId, status: 'timeout', code: 'TIMEOUT' })
          }, TIMEOUT_MS)
          pending.set(requestId, value => { clearTimeout(timer); resolve(value) })
          client.send('workspace-bridge:request', { requestId, operation, ...data })
        })
      }
      let inFlight = false
      server.middlewares.use(async (req, res, next) => {
        const route = req.url?.split('?')[0]
        if (route !== '/__workspace-bridge/workspace' && route !== '/__workspace-bridge/command') return next()
        if (!isLoopback(req.socket.remoteAddress) || req.headers.origin) {
          return json(res, 403, { status: 'error', code: 'FORBIDDEN' })
        }
        const provided = req.headers.authorization?.replace(/^Bearer /, '') ?? ''
        const a = Buffer.from(provided), b = Buffer.from(secret)
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return json(res, 401, { status: 'error', code: 'UNAUTHORIZED' })
        }
        if (inFlight) return json(res, 409, { status: 'error', code: 'BUSY' })
        if (route === '/__workspace-bridge/workspace' && req.method === 'GET') {
          inFlight = true
          try {
            const result = await request('getWorkspace')
            return json(res, result.status === 'ok' ? 200 : 503, result)
          } finally { inFlight = false }
        }
        if (route === '/__workspace-bridge/command' && req.method === 'POST') {
          if (!req.headers['content-type']?.startsWith('application/json')) {
            return json(res, 415, { status: 'error', code: 'CONTENT_TYPE' })
          }
          try {
            const body = await readBody(req)
            if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body')
            const { command, expectedRevision, sessionId } = body as Record<string, unknown>
            if (!Number.isSafeInteger(expectedRevision) || (expectedRevision as number) < 0 ||
                typeof sessionId !== 'string' || sessionId.length > 200 ||
                !command || typeof command !== 'object' || Array.isArray(command)) {
              throw new Error('Invalid command or expectedRevision')
            }
            inFlight = true
            try {
              const result = await request('runCommand', { command, expectedRevision, sessionId })
              const status = result.status
              return json(res, status === 'persisted' ? 200 :
                status === 'unavailable' ? 503 : status === 'timeout' ? 504 :
                status === 'conflict' ? 409 : 400, result)
            } finally { inFlight = false }
          } catch {
            return json(res, 400, { status: 'error', code: 'INVALID_REQUEST' })
          }
        }
        return json(res, 405, { status: 'error', code: 'METHOD_NOT_ALLOWED' })
      })
    },
  }
}
