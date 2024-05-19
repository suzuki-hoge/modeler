import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'delete-property'

const deletePropertyRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  n: z.number(),
})
type DeletePropertyRequest = z.infer<typeof deletePropertyRequest>

const deletePropertyResponse = deletePropertyRequest
type DeletePropertyResponse = z.infer<typeof deletePropertyResponse>

export type DeleteProperty = (objectId: string, n: number) => void

// send

export function createDeleteProperty(
  send: (request: DeletePropertyRequest) => void,
  socket: () => WebSocketLike | null,
): DeleteProperty {
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

export function handleDeleteProperty(response: unknown, handler: (response: DeletePropertyResponse) => void) {
  if (isDeletePropertyResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isDeletePropertyResponse(value: unknown): value is DeletePropertyResponse {
  const json = deletePropertyResponse.safeParse(value)
  return json.success && json.data.type === type
}
