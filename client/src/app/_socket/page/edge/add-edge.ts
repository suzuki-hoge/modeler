import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Edge } from 'reactflow'
import z from 'zod'

import { PageEdgeData } from '@/app/_object/edge/type'

// types

const type = 'add-edge'

const addEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type AddEdgeRequest = z.infer<typeof addEdgeRequest>

const addEdgeResponse = addEdgeRequest
type AddEdgeResponse = z.infer<typeof addEdgeResponse>

export type AddEdge = (edge: Edge<PageEdgeData>) => void

// send

export function createAddEdge(send: (request: AddEdgeRequest) => void, socket: () => WebSocketLike | null): AddEdge {
  return (edge: Edge<PageEdgeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = {
        type,
        objectId: edge.id,
      }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleAddEdge(response: unknown, handler: (response: AddEdgeResponse) => void) {
  if (isAddEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isAddEdgeResponse(value: unknown): value is AddEdgeResponse {
  const json = addEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
