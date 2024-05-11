import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Node, ReactFlowInstance } from 'reactflow'
import z from 'zod'

// types

const addNodeRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  x: z.number(),
  y: z.number(),
})
type AddNodeRequest = z.infer<typeof addNodeRequest>

const addNodeResponse = addNodeRequest
export type AddNodeResponse = AddNodeRequest

// send

export function sendAddNodeRequest(
  send: (request: AddNodeRequest) => void,
  socket: () => WebSocketLike | null,
  node: Node<{ label: string }>,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send add-node')
    send({ type: 'add-node', object_id: node.id, x: node.position.x, y: node.position.y })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleAddNodeResponse(reactFlowInstance: ReactFlowInstance, response: unknown) {
  if (isAddNodeResponse(response)) {
    console.log('handle add-node', response)
    const node: Node = {
      id: response.object_id,
      position: { x: response.x, y: response.y },
      data: { label: '4' },
    }
    reactFlowInstance.addNodes(node)
  }
}

export function isAddNodeResponse(value: unknown): value is AddNodeResponse {
  const json = addNodeResponse.safeParse(value)
  return json.success && json.data.type === 'add-node'
}
