import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Edge } from 'reactflow'
import z from 'zod'

import { EdgeData } from '@/app/_store/edge/type'

// types

const type = 'update-edge'

const updateEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  src: z.string(),
  dst: z.string(),
  arrowType: z.union([z.literal('v-arrow'), z.literal('filled-arrow')]),
  label: z.string(),
})
type UpdateEdgeRequest = z.infer<typeof updateEdgeRequest>

const updateEdgeResponse = updateEdgeRequest
type UpdateEdgeResponse = z.infer<typeof updateEdgeResponse>

export type UpdateEdge = (edge: Edge<EdgeData>) => void

// send

export function createUpdateEdge(
  send: (request: UpdateEdgeRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateEdge {
  return (edge: Edge<EdgeData>) => {
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

export function handleUpdateEdge(response: unknown, handler: (response: UpdateEdgeResponse) => void) {
  if (isUpdateEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isUpdateEdgeResponse(value: unknown): value is UpdateEdgeResponse {
  const json = updateEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
