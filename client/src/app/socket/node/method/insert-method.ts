import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'insert-method'

const insertMethodRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  method: z.string(),
  n: z.number(),
})
type InsertMethodRequest = z.infer<typeof insertMethodRequest>

const insertMethodResponse = insertMethodRequest
type InsertMethodResponse = z.infer<typeof insertMethodResponse>

export type InsertMethod = (objectId: string, method: string, n: number) => void

// send

export function createInsertMethod(
  send: (request: InsertMethodRequest) => void,
  socket: () => WebSocketLike | null,
): InsertMethod {
  return (objectId: string, method: string, n: number) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, method, n }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleInsertMethod(response: unknown, handler: (response: InsertMethodResponse) => void) {
  if (isInsertMethodResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isInsertMethodResponse(value: unknown): value is InsertMethodResponse {
  const json = insertMethodResponse.safeParse(value)
  return json.success && json.data.type === type
}
