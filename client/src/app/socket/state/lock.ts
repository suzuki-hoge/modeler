import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { LockIds } from '@/app/object/state'

// types

const type = 'lock'

const lockRequest = z.object({
  type: z.string(),
  objectIds: z.array(z.string()),
})
type LockRequest = z.infer<typeof lockRequest>

const lockResponse = lockRequest
type LockResponse = z.infer<typeof lockResponse>

export type Lock = (objectIds: LockIds) => void

// send

export function createLock(send: (request: LockRequest) => void, socket: () => WebSocketLike | null): Lock {
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

export function handleLock(response: unknown, handler: (response: LockResponse) => void) {
  if (isLockResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isLockResponse(value: unknown): value is LockResponse {
  const json = lockResponse.safeParse(value)
  return json.success && json.data.type === type
}
