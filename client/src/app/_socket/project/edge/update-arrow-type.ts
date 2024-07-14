import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Edge } from 'reactflow'
import z from 'zod'

import { updateEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-arrow-type'

const updateArrowTypeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  arrowType: z.union([z.literal('simple'), z.literal('generalization')]),
})
type UpdateArrowTypeRequest = z.infer<typeof updateArrowTypeRequest>

const updateArrowTypeResponse = updateArrowTypeRequest
type UpdateArrowTypeResponse = z.infer<typeof updateArrowTypeResponse>

export type UpdateArrowType = (edge: Edge<ProjectEdgeData>) => void

// send

export function createUpdateArrowType(
  send: (request: UpdateArrowTypeRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateArrowType {
  return (edge: Edge<ProjectEdgeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = {
        type,
        objectId: edge.id,
        arrowType: edge.data!.arrowType,
      }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateArrowType(response: unknown, store: ProjectStore) {
  if (isUpdateArrowTypeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateEdge(response.objectId, (edge) => updateEdge(edge, response))
  }
}

function isUpdateArrowTypeResponse(value: unknown): value is UpdateArrowTypeResponse {
  const json = updateArrowTypeResponse.safeParse(value)
  return json.success && json.data.type === type
}
