import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_store/page-store'

// types

const type = 'lock'

const lockRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type LockRequest = z.infer<typeof lockRequest>

const lockResponse = lockRequest
type LockResponse = z.infer<typeof lockResponse>

export type Lock = (objectId: string) => void

// send

type Sender = (request: LockRequest) => void

export function sendLock(sender: Sender, state: ReadyState, objectId: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleLock(response: unknown, store: PageStore) {
  if (isLockResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.lock(response.objectId)
  }
}

function isLockResponse(value: unknown): value is LockResponse {
  const json = lockResponse.safeParse(value)
  return json.success && json.data.type === type
}
