import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { Unlock } from '@/app/object/store'

// types

const type = 'unlock'

const unlockRequest = z.object({
  type: z.string(),
  object_ids: z.array(z.string()),
})
type UnlockRequest = z.infer<typeof unlockRequest>

const unlockResponse = unlockRequest
export type UnlockResponse = z.infer<typeof unlockResponse>

// send

export function sendUnlockRequest(
  send: (request: UnlockRequest) => void,
  socket: () => WebSocketLike | null,
  objectIds: string[],
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectIds, `send ${type}`)
    send({ type: type, object_ids: objectIds })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleUnlockResponse(unlock: Unlock, response: unknown) {
  if (isUnlockResponse(response)) {
    console.log(response.object_ids, `handle ${type}`, response)
    unlock(response.object_ids)
  }
}

export function isUnlockResponse(value: unknown): value is UnlockResponse {
  const json = unlockResponse.safeParse(value)
  return json.success && json.data.type === type
}
