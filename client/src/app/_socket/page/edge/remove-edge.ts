import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
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

export type RemoveEdge = (objectId: string) => void

// send

export function createRemoveEdge(
  send: (request: RemoveEdgeRequest) => void,
  socket: () => WebSocketLike | null,
): RemoveEdge {
  return (objectId: string) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
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
