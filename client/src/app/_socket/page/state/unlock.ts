import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_store/page-store'

// types

const type = 'unlock'

const unlockRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type UnlockRequest = z.infer<typeof unlockRequest>

const unlockResponse = unlockRequest
type UnlockResponse = z.infer<typeof unlockResponse>

export type Unlock = (objectId: string) => void

// send

type Sender = (request: UnlockRequest) => void

export function sendUnlock(sender: Sender, state: ReadyState, objectId: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleUnlock(response: unknown, store: PageStore) {
  if (isUnlockResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.unlock(response.objectId)
  }
}

function isUnlockResponse(value: unknown): value is UnlockResponse {
  const json = unlockResponse.safeParse(value)
  return json.success && json.data.type === type
}
