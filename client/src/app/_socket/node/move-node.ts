import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'move-node'

const moveNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  x: z.number(),
  y: z.number(),
})
type MoveNodeRequest = z.infer<typeof moveNodeRequest>

const moveNodeResponse = moveNodeRequest
type MoveNodeResponse = z.infer<typeof moveNodeResponse>

export type MoveNode = (objectId: string, x: number, y: number) => void

// send

export function createMoveNode(send: (request: MoveNodeRequest) => void, socket: () => WebSocketLike | null): MoveNode {
  return (objectId: string, x: number, y: number) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, x, y }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleMoveNode(response: unknown, handler: (response: MoveNodeResponse) => void) {
  if (isMoveNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isMoveNodeResponse(value: unknown): value is MoveNodeResponse {
  const json = moveNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
