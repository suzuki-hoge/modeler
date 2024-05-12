import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'unlock'

const unlockRequest = z.object({
  type: z.string(),
  object_id: z.string(),
})
type UnlockRequest = z.infer<typeof unlockRequest>

const unlockResponse = unlockRequest
export type UnlockResponse = z.infer<typeof unlockResponse>

// send

export function sendUnlockRequest(
  send: (request: UnlockRequest) => void,
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

export function handleUnlockResponse(response: unknown) {
  if (isUnlockResponse(response)) {
    console.log(`handle ${type}`, response)
  }
}

export function isUnlockResponse(value: unknown): value is UnlockResponse {
  const json = unlockResponse.safeParse(value)
  return json.success && json.data.type === type
}
