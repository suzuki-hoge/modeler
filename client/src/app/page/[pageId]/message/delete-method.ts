import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { DeleteMethod } from '@/app/page/[pageId]/object/store'

// types

const type = 'delete-method'

const deleteMethodRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  n: z.number(),
})
type DeleteMethodRequest = z.infer<typeof deleteMethodRequest>

const deleteMethodResponse = deleteMethodRequest
export type DeleteMethodResponse = DeleteMethodRequest

// send

export function sendDeleteMethodRequest(
  send: (request: DeleteMethodRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  n: number,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(`send ${type}`)
    send({ type: type, object_id: objectId, n: n })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleDeleteMethodResponse(deleteMethod: DeleteMethod, response: unknown) {
  if (isDeleteMethodResponse(response)) {
    console.log(`handle ${type}`, response)
    deleteMethod(response.object_id, response.n)
  }
}

export function isDeleteMethodResponse(value: unknown): value is DeleteMethodResponse {
  const json = deleteMethodResponse.safeParse(value)
  return json.success && json.data.type === type
}
