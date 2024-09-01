import { Node } from '@xyflow/react'
import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageNodeData } from '@/app/_flow/object/node/type'
import { PageStore } from '@/app/_flow/store/page-store'

// types

const type = 'add-node'

const addNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  objectType: z.string(),
  x: z.number(),
  y: z.number(),
})
type AddNodeRequest = z.infer<typeof addNodeRequest>

const addNodeResponse = addNodeRequest
type AddNodeResponse = z.infer<typeof addNodeResponse>

// send

type Sender = (request: AddNodeRequest) => void

export function sendAddNode(sender: Sender, state: ReadyState, node: Node<PageNodeData>): void {
  if (state === ReadyState.OPEN) {
    const request = {
      type,
      objectId: node.id,
      objectType: node.type || 'unknown',
      x: node.position.x,
      y: node.position.y,
    }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleAddNode(response: unknown, store: PageStore) {
  if (isAddNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.addNode({
      id: response.objectId,
      type: response.objectType,
      position: { x: response.x, y: response.y },
      data: { created: Date.now(), modified: '' },
    })
  }
}

function isAddNodeResponse(value: unknown): value is AddNodeResponse {
  const json = addNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
