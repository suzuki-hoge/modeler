import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { LockIds } from '@/app/_store/state/lock'

// types

const type = 'unlock'

const unlockRequest = z.object({
  type: z.string(),
  objectIds: z.array(z.string()),
})
type UnlockRequest = z.infer<typeof unlockRequest>

const unlockResponse = unlockRequest
type UnlockResponse = z.infer<typeof unlockResponse>

export type Unlock = (objectIds: LockIds) => void

// send

export function createUnlock(send: (request: UnlockRequest) => void, socket: () => WebSocketLike | null): Unlock {
  return (objectIds: LockIds) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectIds: objectIds.toArray() }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUnlock(response: unknown, handler: (response: UnlockResponse) => void) {
  if (isUnlockResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isUnlockResponse(value: unknown): value is UnlockResponse {
  const json = unlockResponse.safeParse(value)
  return json.success && json.data.type === type
}
