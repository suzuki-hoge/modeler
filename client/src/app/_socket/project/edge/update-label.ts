import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Edge } from 'reactflow'
import z from 'zod'

import { updateEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-label'

const updateLabelRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  label: z.string(),
})
type UpdateLabelRequest = z.infer<typeof updateLabelRequest>

const updateLabelResponse = updateLabelRequest
type UpdateLabelResponse = z.infer<typeof updateLabelResponse>

export type UpdateLabel = (edge: Edge<ProjectEdgeData>) => void

// send

export function createUpdateLabel(
  send: (request: UpdateLabelRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateLabel {
  return (edge: Edge<ProjectEdgeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = {
        type,
        objectId: edge.id,
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

export function handleUpdateLabel(response: unknown, store: ProjectStore) {
  if (isUpdateLabelResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateEdge(response.objectId, (edge) => updateEdge(edge, response))
  }
}

function isUpdateLabelResponse(value: unknown): value is UpdateLabelResponse {
  const json = updateLabelResponse.safeParse(value)
  return json.success && json.data.type === type
}
