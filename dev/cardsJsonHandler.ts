import fs from 'node:fs/promises'
import { createError, defineEventHandler, getRequestURL, setHeader } from 'h3'

export const createCardsJsonHandler = (sourcePath: string) => defineEventHandler(async (event) => {
  // devServerHandlersはprefix登録。mount前のURLで完全一致を確認する。
  if (getRequestURL(event).pathname !== '/data/cards.json') return
  if (event.method !== 'GET') {
    setHeader(event, 'Allow', 'GET')
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  let body: Buffer
  try {
    body = await fs.readFile(sourcePath)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Failed to read cards data' })
  }
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache')
  return body
})
