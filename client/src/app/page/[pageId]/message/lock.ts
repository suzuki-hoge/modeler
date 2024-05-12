import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'lock'

const lockRequest = z.object({
  type: z.string(),
  object_id: z.string(),
})
type LockRequest = z.infer<typeof lockRequest>

const lockResponse = lockRequest
export type LockResponse = z.infer<typeof lockResponse>

// send

export function sendLockRequest(
  send: (request: LockRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(`send ${type}`)
    send({ type: type, object_id: objectId })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleLockResponse(response: unknown) {
  if (isLockResponse(response)) {
    console.log(`handle ${type}`, response)
  }
}

export function isLockResponse(value: unknown): value is LockResponse {
  const json = lockResponse.safeParse(value)
  return json.success && json.data.type === type
}
