import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_store/page-store'

// types

const type = 'remove-node'

const removeNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type RemoveNodeRequest = z.infer<typeof removeNodeRequest>

const removeNodeResponse = removeNodeRequest
type RemoveNodeResponse = z.infer<typeof removeNodeResponse>

export type RemoveNode = (objectId: string) => void

// send

type Sender = (request: RemoveNodeRequest) => void

export function sendRemoveNode(sender: Sender, state: ReadyState, objectId: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleRemoveNode(response: unknown, store: PageStore) {
  if (isRemoveNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.removeNode(response.objectId)
  }
}

function isRemoveNodeResponse(value: unknown): value is RemoveNodeResponse {
  const json = removeNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
