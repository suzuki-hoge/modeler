import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_store/page-store'

// types

const type = 'remove-edge'

const removeEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type RemoveEdgeRequest = z.infer<typeof removeEdgeRequest>

const removeEdgeResponse = removeEdgeRequest
type RemoveEdgeResponse = z.infer<typeof removeEdgeResponse>

// send

type Sender = (request: RemoveEdgeRequest) => void

export function sendRemoveEdge(sender: Sender, state: ReadyState, objectId: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleRemoveEdge(response: unknown, store: PageStore) {
  if (isRemoveEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.removeEdge(response.objectId)
  }
}

function isRemoveEdgeResponse(value: unknown): value is RemoveEdgeResponse {
  const json = removeEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
