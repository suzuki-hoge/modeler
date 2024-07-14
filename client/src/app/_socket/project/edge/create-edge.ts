import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Edge } from 'reactflow'
import z from 'zod'

import { createEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'create-edge'

const createEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  source: z.string(),
  target: z.string(),
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
        source: edge.source,
        target: edge.target,
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

export function handleCreateEdge(response: unknown, store: ProjectStore) {
  if (isCreateEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.createEdge(
      createEdge(response.objectId, response.source, response.target, response.arrowType, response.label),
    )
  }
}

function isCreateEdgeResponse(value: unknown): value is CreateEdgeResponse {
  const json = createEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
