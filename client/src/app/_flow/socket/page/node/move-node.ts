import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_flow/store/page-store'

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

// send

type Sender = (request: MoveNodeRequest) => void

export function sendMoveNode(sender: Sender, state: ReadyState, objectId: string, x: number, y: number): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId, x, y }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleMoveNode(response: unknown, store: PageStore) {
  if (isMoveNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.moveNode(response.objectId, response.x, response.y)
  }
}

function isMoveNodeResponse(value: unknown): value is MoveNodeResponse {
  const json = moveNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
