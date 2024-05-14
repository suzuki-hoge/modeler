import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { DeleteProperty } from '@/app/object/store'

// types

const type = 'delete-property'

const deletePropertyRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  n: z.number(),
})
type DeletePropertyRequest = z.infer<typeof deletePropertyRequest>

const deletePropertyResponse = deletePropertyRequest
export type DeletePropertyResponse = DeletePropertyRequest

// send

export function sendDeletePropertyRequest(
  send: (request: DeletePropertyRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  n: number,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectId, `send ${type}`)
    send({ type: type, object_id: objectId, n: n })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleDeletePropertyResponse(deleteProperty: DeleteProperty, response: unknown) {
  if (isDeletePropertyResponse(response)) {
    console.log(response.object_id, `handle ${type}`, response)
    deleteProperty(response.object_id, response.n)
  }
}

export function isDeletePropertyResponse(value: unknown): value is DeletePropertyResponse {
  const json = deletePropertyResponse.safeParse(value)
  return json.success && json.data.type === type
}
