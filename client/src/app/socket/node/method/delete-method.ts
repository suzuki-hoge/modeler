import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'delete-method'

const deleteMethodRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  n: z.number(),
})
type DeleteMethodRequest = z.infer<typeof deleteMethodRequest>

const deleteMethodResponse = deleteMethodRequest
type DeleteMethodResponse = z.infer<typeof deleteMethodResponse>

export type DeleteMethod = (objectId: string, n: number) => void

// send

export function createDeleteMethod(
  send: (request: DeleteMethodRequest) => void,
  socket: () => WebSocketLike | null,
): DeleteMethod {
  return (objectId: string, n: number) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, n }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleDeleteMethod(response: unknown, handler: (response: DeleteMethodResponse) => void) {
  if (isDeleteMethodResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isDeleteMethodResponse(value: unknown): value is DeleteMethodResponse {
  const json = deleteMethodResponse.safeParse(value)
  return json.success && json.data.type === type
}
