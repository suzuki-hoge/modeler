import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'remove-node'

const removeNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type RemoveNodeRequest = z.infer<typeof removeNodeRequest>

const removeNodeResponse = removeNodeRequest
type RemoveNodeResponse = z.infer<typeof removeNodeResponse>

export type RemoveNode = (objectId: string) => void

// send

export function createRemoveNode(
  send: (request: RemoveNodeRequest) => void,
  socket: () => WebSocketLike | null,
): RemoveNode {
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

export function handleRemoveNode(response: unknown, handler: (response: RemoveNodeResponse) => void) {
  if (isRemoveNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isRemoveNodeResponse(value: unknown): value is RemoveNodeResponse {
  const json = removeNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
