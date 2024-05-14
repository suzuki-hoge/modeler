import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { UpdateMethod } from '@/app/object/store'

// types

const type = 'update-method'

const updateMethodRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  method: z.string(),
  n: z.number(),
})
type UpdateMethodRequest = z.infer<typeof updateMethodRequest>

const updateMethodResponse = updateMethodRequest
export type UpdateMethodResponse = UpdateMethodRequest

// send

export function sendUpdateMethodRequest(
  send: (request: UpdateMethodRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  method: string,
  n: number,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectId, `send ${type}`)
    send({ type: type, object_id: objectId, method: method, n: n })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleUpdateMethodResponse(updateMethod: UpdateMethod, response: unknown) {
  if (isUpdateMethodResponse(response)) {
    console.log(response.object_id, `handle ${type}`, response)
    updateMethod(response.object_id, response.method, response.n)
  }
}

export function isUpdateMethodResponse(value: unknown): value is UpdateMethodResponse {
  const json = updateMethodResponse.safeParse(value)
  return json.success && json.data.type === type
}
