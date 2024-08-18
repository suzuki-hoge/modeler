import { Edge } from '@xyflow/react'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { updateProjectEdge } from '@/app/_object/edge/function'
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

// send

type Sender = (request: UpdateLabelRequest) => void

export function sendUpdateLabel(sender: Sender, state: ReadyState, edge: Edge<ProjectEdgeData>): void {
  if (state === ReadyState.OPEN) {
    const request = {
      type,
      objectId: edge.id,
      label: edge.data!.label,
    }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleUpdateLabel(response: unknown, store: ProjectStore) {
  if (isUpdateLabelResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateEdge(response.objectId, (edge) => updateProjectEdge(edge, response))
  }
}

function isUpdateLabelResponse(value: unknown): value is UpdateLabelResponse {
  const json = updateLabelResponse.safeParse(value)
  return json.success && json.data.type === type
}
