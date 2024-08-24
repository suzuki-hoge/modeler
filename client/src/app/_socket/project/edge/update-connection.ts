import { Edge } from '@xyflow/react'
import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { updateProjectEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-connection'

const updateConnectionRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  source: z.string(),
  target: z.string(),
})
type UpdateConnectionRequest = z.infer<typeof updateConnectionRequest>

const updateConnectionResponse = updateConnectionRequest
type UpdateConnectionResponse = z.infer<typeof updateConnectionResponse>

// send

type Sender = (request: UpdateConnectionRequest) => void

export function sendUpdateConnection(sender: Sender, state: ReadyState, edge: Edge<ProjectEdgeData>): void {
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
    toast.error('Disconnected.')
  }
}

// handle

export function handleUpdateConnection(response: unknown, store: ProjectStore) {
  if (isUpdateConnectionResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateEdge(response.objectId, (edge) => updateProjectEdge(edge, response))
  }
}

function isUpdateConnectionResponse(value: unknown): value is UpdateConnectionResponse {
  const json = updateConnectionResponse.safeParse(value)
  return json.success && json.data.type === type
}
