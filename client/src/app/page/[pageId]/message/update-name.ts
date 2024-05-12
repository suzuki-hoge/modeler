import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { UpdateName } from '@/app/page/[pageId]/object/store'

// types

const type = 'update-name'

const updateNameRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  name: z.string(),
})
type UpdateNameRequest = z.infer<typeof updateNameRequest>

const updateNameResponse = updateNameRequest
export type UpdateNameResponse = UpdateNameRequest

// send

export function sendUpdateNameRequest(
  send: (request: UpdateNameRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  name: string,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(`send ${type}`)
    send({ type: type, object_id: objectId, name: name })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleUpdateNameResponse(updateName: UpdateName, response: unknown) {
  if (isUpdateNameResponse(response)) {
    console.log(`handle ${type}`, response)
    updateName(response.object_id, response.name)
  }
}

export function isUpdateNameResponse(value: unknown): value is UpdateNameResponse {
  const json = updateNameResponse.safeParse(value)
  return json.success && json.data.type === type
}
