import { Edge } from '@xyflow/react'
import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { createProjectEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'create-edge'

const createEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  objectType: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string(),
  targetHandle: z.string(),
  arrowType: z.union([z.literal('simple'), z.literal('generalization')]),
  label: z.string(),
})
type CreateEdgeRequest = z.infer<typeof createEdgeRequest>

const createEdgeResponse = createEdgeRequest
type CreateEdgeResponse = z.infer<typeof createEdgeResponse>

// send

type Sender = (request: CreateEdgeRequest) => void

export function sendCreateEdge(sender: Sender, state: ReadyState, edge: Edge<ProjectEdgeData>): void {
  if (state === ReadyState.OPEN) {
    const request = {
      type,
      objectId: edge.id,
      objectType: edge.type || 'unknown',
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || 'unknown',
      targetHandle: edge.targetHandle || 'unknown',
      arrowType: edge.data!.arrowType,
      label: edge.data!.label,
    }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleCreateEdge(response: unknown, store: ProjectStore) {
  if (isCreateEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.createEdge(
      createProjectEdge(response.objectId, response.source, response.target, response.arrowType, response.label),
    )
  }
}

function isCreateEdgeResponse(value: unknown): value is CreateEdgeResponse {
  const json = createEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
