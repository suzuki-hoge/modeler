import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'insert-property'

const insertPropertyRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  property: z.string(),
  n: z.number(),
})
type InsertPropertyRequest = z.infer<typeof insertPropertyRequest>

const insertPropertyResponse = insertPropertyRequest
type InsertPropertyResponse = z.infer<typeof insertPropertyResponse>

export type InsertProperty = (objectId: string, property: string, n: number) => void

// send

export function createInsertProperty(
  send: (request: InsertPropertyRequest) => void,
  socket: () => WebSocketLike | null,
): InsertProperty {
  return (objectId: string, property: string, n: number) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, property, n }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleInsertProperty(response: unknown, handler: (response: InsertPropertyResponse) => void) {
  if (isInsertPropertyResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isInsertPropertyResponse(value: unknown): value is InsertPropertyResponse {
  const json = insertPropertyResponse.safeParse(value)
  return json.success && json.data.type === type
}
