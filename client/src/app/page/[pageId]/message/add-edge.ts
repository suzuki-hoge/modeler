import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Connection, Edge, ReactFlowInstance } from 'reactflow'
import z from 'zod'

// types

const addEdgeRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  src: z.string(),
  dst: z.string(),
})
type AddEdgeRequest = z.infer<typeof addEdgeRequest>

const addEdgeResponse = addEdgeRequest
export type AddEdgeResponse = z.infer<typeof addEdgeResponse>

// send

export function sendAddEdgeRequest(
  send: (request: AddEdgeRequest) => void,
  socket: () => WebSocketLike | null,
  connection: Connection,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send add-edge')
    send({ type: 'add-edge', object_id: crypto.randomUUID(), src: connection.source!, dst: connection.target! })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleAddEdgeResponse(reactFlowInstance: ReactFlowInstance, response: unknown) {
  if (isAddEdgeResponse(response)) {
    console.log('handle add-edge', response)
    const edge: Edge = {
      id: response.object_id,
      type: 'smoothstep',
      source: response.src,
      target: response.dst,
    }
    reactFlowInstance.addEdges(edge)
  }
}

export function isAddEdgeResponse(value: unknown): value is AddEdgeResponse {
  const json = addEdgeResponse.safeParse(value)
  return json.success && json.data.type === 'add-edge'
}
