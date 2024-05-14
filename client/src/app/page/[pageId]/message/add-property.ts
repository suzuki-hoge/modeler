import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { AddProperty } from '@/app/page/[pageId]/object/store'

// types

const type = 'add-property'

const addPropertyRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  property: z.string(),
  n: z.number(),
})
type AddPropertyRequest = z.infer<typeof addPropertyRequest>

const addPropertyResponse = addPropertyRequest
export type AddPropertyResponse = AddPropertyRequest

// send

export function sendAddPropertyRequest(
  send: (request: AddPropertyRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  n: number,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectId, `send ${type}`)
    send({ type: type, object_id: objectId, property: '', n: n })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleAddPropertyResponse(addProperty: AddProperty, response: unknown) {
  if (isAddPropertyResponse(response)) {
    console.log(response.object_id, `handle ${type}`, response)
    addProperty(response.object_id, response.n)
  }
}

export function isAddPropertyResponse(value: unknown): value is AddPropertyResponse {
  const json = addPropertyResponse.safeParse(value)
  return json.success && json.data.type === type
}
