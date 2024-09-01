import { Edge } from '@xyflow/react'
import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { updateProjectEdge } from '@/app/_flow/object/edge/function'
import { ProjectEdgeData } from '@/app/_flow/object/edge/type'
import { ProjectStore } from '@/app/_flow/store/project-store'

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

// send

type Sender = (request: UpdateArrowTypeRequest) => void

export function sendUpdateArrowType(sender: Sender, state: ReadyState, edge: Edge<ProjectEdgeData>): void {
  if (state === ReadyState.OPEN) {
    const request = {
      type,
      objectId: edge.id,
      arrowType: edge.data!.arrowType,
    }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleUpdateArrowType(response: unknown, store: ProjectStore) {
  if (isUpdateArrowTypeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateEdge(response.objectId, (edge) => updateProjectEdge(edge, response))
  }
}

function isUpdateArrowTypeResponse(value: unknown): value is UpdateArrowTypeResponse {
  const json = updateArrowTypeResponse.safeParse(value)
  return json.success && json.data.type === type
}
