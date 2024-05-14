import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { MoveNode } from '@/app/object/store'

// types

const type = 'move-node'

const moveNodeRequest = z.object({
  type: z.string(),
  object_id: z.string(),
  x: z.number(),
  y: z.number(),
})
type MoveNodeRequest = z.infer<typeof moveNodeRequest>

const moveNodeResponse = moveNodeRequest
export type MoveNodeResponse = MoveNodeRequest

// send

export function sendMoveNodeRequest(
  send: (request: MoveNodeRequest) => void,
  socket: () => WebSocketLike | null,
  objectId: string,
  x: number,
  y: number,
) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log(objectId, `send ${type}`)
    send({ type: type, object_id: objectId, x: x, y: y })
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleMoveNodeResponse(moveNode: MoveNode, response: unknown) {
  if (isMoveNodeResponse(response)) {
    console.log(response.object_id, `handle ${type}`, response)
    moveNode(response.object_id, response.x, response.y)
  }
}

export function isMoveNodeResponse(value: unknown): value is MoveNodeResponse {
  const json = moveNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
