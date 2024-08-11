import { Edge } from '@xyflow/react'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageEdgeData } from '@/app/_object/edge/type'
import { PageStore } from '@/app/_store/page-store' // types

// types

const type = 'add-edge'

const addEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  source: z.string(),
  target: z.string(),
})
type AddEdgeRequest = z.infer<typeof addEdgeRequest>

const addEdgeResponse = addEdgeRequest
type AddEdgeResponse = z.infer<typeof addEdgeResponse>

export type AddEdge = (edge: Edge<PageEdgeData>) => void

// send

type Sender = (request: AddEdgeRequest) => void

export function sendAddEdge(sender: Sender, state: ReadyState, edge: Edge<PageEdgeData>): void {
  if (state === ReadyState.OPEN) {
    const request = {
      type,
      objectId: edge.id,
      source: edge.source,
      target: edge.target,
    }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleAddEdge(response: unknown, store: PageStore) {
  if (isAddEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.addEdge({ id: response.objectId, source: response.source, target: response.target, data: {} })
  }
}

function isAddEdgeResponse(value: unknown): value is AddEdgeResponse {
  const json = addEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
