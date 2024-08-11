import { Node } from '@xyflow/react'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { createProjectNode } from '@/app/_object/node/function'
import { ProjectNodeData } from '@/app/_object/node/type'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'create-node'

const createNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  iconId: z.string(),
  name: z.string(),
})
type CreateNodeRequest = z.infer<typeof createNodeRequest>

const createNodeResponse = createNodeRequest
type CreateNodeResponse = z.infer<typeof createNodeResponse>

export type CreateNode = (node: Node<ProjectNodeData>) => void

// send

type Sender = (request: CreateNodeRequest) => void

export function sendCreateNode(sender: Sender, state: ReadyState, node: Node<ProjectNodeData>): void {
  if (state === ReadyState.OPEN) {
    const request = {
      type,
      objectId: node.id,
      iconId: node.data.iconId,
      name: node.data.name,
    }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleCreateNode(response: unknown, store: ProjectStore) {
  if (isCreateNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.createNode(createProjectNode(response.objectId, response.name))
  }
}

function isCreateNodeResponse(value: unknown): value is CreateNodeResponse {
  const json = createNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
