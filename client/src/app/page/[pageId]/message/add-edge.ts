import { ReadyState } from 'react-use-websocket'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Connection, Edge, ReactFlowInstance } from 'reactflow'
import z from 'zod'

// types

const type = 'add-edge'

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

export function sendAddEdgeRequest(send: SendJsonMessage, socket: () => WebSocketLike | null, connection: Connection) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(`send ${type}`)
    send({ type: type, object_id: crypto.randomUUID(), src: connection.source!, dst: connection.target! })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleAddEdgeResponse(reactFlowInstance: ReactFlowInstance, response: unknown) {
  if (isAddEdgeResponse(response)) {
    console.log(`handle ${type}`, response)
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
  return json.success && json.data.type === type
}
