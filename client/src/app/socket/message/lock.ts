import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { Lock } from '@/app/object/store'

// types

const type = 'lock'

const lockRequest = z.object({
  type: z.string(),
  object_ids: z.array(z.string()),
})
type LockRequest = z.infer<typeof lockRequest>

const lockResponse = lockRequest
export type LockResponse = z.infer<typeof lockResponse>

// send

export function sendLockRequest(
  send: (request: LockRequest) => void,
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

export function handleLockResponse(lock: Lock, response: unknown) {
  if (isLockResponse(response)) {
    console.log(response.object_ids, `handle ${type}`, response)
    lock(response.object_ids)
  }
}

export function isLockResponse(value: unknown): value is LockResponse {
  const json = lockResponse.safeParse(value)
  return json.success && json.data.type === type
}
