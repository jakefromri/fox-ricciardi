// Minimal Vercel serverless function types — avoids needing @vercel/node as a dep
import type { IncomingMessage, ServerResponse } from 'http'

export interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>
  body: any
  cookies: Record<string, string>
}

export interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse
  json(body: unknown): void
  send(body: unknown): void
  redirect(url: string): void
}
