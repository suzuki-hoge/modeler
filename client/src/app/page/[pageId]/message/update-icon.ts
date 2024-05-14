import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { UpdateIcon } from '@/app/page/[pageId]/object/store'

// types

const type = 'update-icon'

const updateIconRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  icon: z.string(),
})
type UpdateIconRequest = z.infer<typeof updateIconRequest>

const updateIconResponse = updateIconRequest
export type UpdateIconResponse = UpdateIconRequest

// send

export function sendUpdateIconRequest(
  send: (request: UpdateIconRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  icon: string,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectId, `send ${type}`)
    send({ type: type, object_id: objectId, icon: icon })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleUpdateIconResponse(updateIcon: UpdateIcon, response: unknown) {
  if (isUpdateIconResponse(response)) {
    console.log(response.object_id, `handle ${type}`, response)
    updateIcon(response.object_id, response.icon)
  }
}

export function isUpdateIconResponse(value: unknown): value is UpdateIconResponse {
  const json = updateIconResponse.safeParse(value)
  return json.success && json.data.type === type
}
