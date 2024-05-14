import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { UpdateProperty } from '@/app/object/store'

// types

const type = 'update-property'

const updatePropertyRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  property: z.string(),
  n: z.number(),
})
type UpdatePropertyRequest = z.infer<typeof updatePropertyRequest>

const updatePropertyResponse = updatePropertyRequest
export type UpdatePropertyResponse = UpdatePropertyRequest

// send

export function sendUpdatePropertyRequest(
  send: (request: UpdatePropertyRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  property: string,
  n: number,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectId, `send ${type}`)
    send({ type: type, object_id: objectId, property: property, n: n })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleUpdatePropertyResponse(updateProperty: UpdateProperty, response: unknown) {
  if (isUpdatePropertyResponse(response)) {
    console.log(response.object_id, `handle ${type}`, response)
    updateProperty(response.object_id, response.property, response.n)
  }
}

export function isUpdatePropertyResponse(value: unknown): value is UpdatePropertyResponse {
  const json = updatePropertyResponse.safeParse(value)
  return json.success && json.data.type === type
}
