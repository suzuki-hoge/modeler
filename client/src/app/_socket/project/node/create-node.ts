import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Node } from 'reactflow'
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

export function createCreateNode(
  send: (request: CreateNodeRequest) => void,
  socket: () => WebSocketLike | null,
): CreateNode {
  return (node: Node<ProjectNodeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = {
        type,
        objectId: node.id,
        iconId: node.data.iconId,
        name: node.data.name,
      }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
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
