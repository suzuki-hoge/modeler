import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Edge } from 'reactflow'
import z from 'zod'

import { ProjectEdgeData } from '@/app/_object/edge/type'

// types

const type = 'create-edge'

const createEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  src: z.string(),
  dst: z.string(),
  arrowType: z.union([z.literal('simple'), z.literal('generalization')]),
  label: z.string(),
})
type CreateEdgeRequest = z.infer<typeof createEdgeRequest>

const createEdgeResponse = createEdgeRequest
type CreateEdgeResponse = z.infer<typeof createEdgeResponse>

export type CreateEdge = (edge: Edge<ProjectEdgeData>) => void

// send

export function createCreateEdge(
  send: (request: CreateEdgeRequest) => void,
  socket: () => WebSocketLike | null,
): CreateEdge {
  return (edge: Edge<ProjectEdgeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = {
        type,
        objectId: edge.id,
        src: edge.source,
        dst: edge.target,
        arrowType: edge.data!.arrowType,
        label: edge.data!.label,
      }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleCreateEdge(response: unknown, handler: (response: CreateEdgeResponse) => void) {
  if (isCreateEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isCreateEdgeResponse(value: unknown): value is CreateEdgeResponse {
  const json = createEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
