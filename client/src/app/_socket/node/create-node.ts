import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Node } from 'reactflow'
import z from 'zod'

import { NodeData } from '@/app/_object/node/type'

// types

const type = 'create-node'

const createNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  x: z.number(),
  y: z.number(),
  iconId: z.string(),
  name: z.string(),
})
type CreateNodeRequest = z.infer<typeof createNodeRequest>

const createNodeResponse = createNodeRequest
type CreateNodeResponse = z.infer<typeof createNodeResponse>

export type CreateNode = (node: Node<NodeData>) => void

// send

export function createCreateNode(
  send: (request: CreateNodeRequest) => void,
  socket: () => WebSocketLike | null,
): CreateNode {
  return (node: Node<NodeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = {
        type,
        objectId: node.id,
        x: node.position.x,
        y: node.position.y,
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

export function handleCreateNode(response: unknown, handler: (response: CreateNodeResponse) => void) {
  if (isCreateNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isCreateNodeResponse(value: unknown): value is CreateNodeResponse {
  const json = createNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
