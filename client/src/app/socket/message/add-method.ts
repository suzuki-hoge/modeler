import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { AddMethod } from '@/app/object/store'

// types

const type = 'add-method'

const addMethodRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  method: z.string(),
  n: z.number(),
})
type AddMethodRequest = z.infer<typeof addMethodRequest>

const addMethodResponse = addMethodRequest
export type AddMethodResponse = AddMethodRequest

// send

export function sendAddMethodRequest(
  send: (request: AddMethodRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  n: number,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectId, `send ${type}`)
    send({ type: type, object_id: objectId, method: '', n: n })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleAddMethodResponse(addMethod: AddMethod, response: unknown) {
  if (isAddMethodResponse(response)) {
    console.log(response.object_id, `handle ${type}`, response)
    addMethod(response.object_id, response.n)
  }
}

export function isAddMethodResponse(value: unknown): value is AddMethodResponse {
  const json = addMethodResponse.safeParse(value)
  return json.success && json.data.type === type
}
