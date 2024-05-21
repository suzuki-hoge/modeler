import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Node } from 'reactflow'
import z from 'zod'

import { NodeData } from '@/app/object/node/type'

// types

const type = 'add-node'

const addNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  x: z.number(),
  y: z.number(),
})
type AddNodeRequest = z.infer<typeof addNodeRequest>

const addNodeResponse = addNodeRequest
type AddNodeResponse = z.infer<typeof addNodeResponse>

export type AddNode = (node: Node<NodeData>) => void

// send

export function createAddNode(send: (request: AddNodeRequest) => void, socket: () => WebSocketLike | null): AddNode {
  return (node: Node<NodeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId: node.id, x: node.position.x, y: node.position.y }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleAddNode(response: unknown, handler: (response: AddNodeResponse) => void) {
  if (isAddNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isAddNodeResponse(value: unknown): value is AddNodeResponse {
  const json = addNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
