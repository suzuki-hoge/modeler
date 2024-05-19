import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'delete-edge'

const deleteEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type DeleteEdgeRequest = z.infer<typeof deleteEdgeRequest>

const deleteEdgeResponse = deleteEdgeRequest
type DeleteEdgeResponse = z.infer<typeof deleteEdgeResponse>

export type DeleteEdge = (objectId: string) => void

// send

export function createDeleteEdge(
  send: (request: DeleteEdgeRequest) => void,
  socket: () => WebSocketLike | null,
): DeleteEdge {
  return (objectId: string) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleDeleteEdge(response: unknown, handler: (response: DeleteEdgeResponse) => void) {
  if (isDeleteEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isDeleteEdgeResponse(value: unknown): value is DeleteEdgeResponse {
  const json = deleteEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
