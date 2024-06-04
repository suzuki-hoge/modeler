import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'update-method'

const updateMethodRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  method: z.string(),
  n: z.number(),
})
type UpdateMethodRequest = z.infer<typeof updateMethodRequest>

const updateMethodResponse = updateMethodRequest
type UpdateMethodResponse = z.infer<typeof updateMethodResponse>

export type UpdateMethod = (objectId: string, method: string, n: number) => void

// send

export function createUpdateMethod(
  send: (request: UpdateMethodRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateMethod {
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

export function handleUpdateMethod(response: unknown, handler: (response: UpdateMethodResponse) => void) {
  if (isUpdateMethodResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isUpdateMethodResponse(value: unknown): value is UpdateMethodResponse {
  const json = updateMethodResponse.safeParse(value)
  return json.success && json.data.type === type
}
